import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/FlatListings.css";

const FlatListings = () => {
  const [flats, setFlats] = useState([]);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    location: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    price: "",
    bedrooms: 1,
    bathrooms: 1,
    area: "",
    furnished: "Furnished",
    image: "",
    description: "",
    contactName: "",
    contactPhone: "",
    contactEmail: ""
  });
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1: // Basic Information
        if (!form.title.trim()) newErrors.title = "Property title is required";
        if (!form.description.trim()) newErrors.description = "Property description is required";
        if (!form.price.trim()) newErrors.price = "Price is required";
        if (!form.bedrooms || form.bedrooms < 1) newErrors.bedrooms = "Number of bedrooms is required";
        if (!form.bathrooms || form.bathrooms < 1) newErrors.bathrooms = "Number of bathrooms is required";
        if (!form.area || form.area < 1) newErrors.area = "Property area is required";
        break;
      case 2: // Location Details
        if (!form.address.trim()) newErrors.address = "Full address is required";
        if (!form.location.trim()) newErrors.location = "Location/Area is required";
        if (!form.city.trim()) newErrors.city = "City is required";
        if (!form.state.trim()) newErrors.state = "State is required";
        if (!form.pincode.trim()) newErrors.pincode = "Pincode is required";
        else if (!/^\d{6}$/.test(form.pincode)) newErrors.pincode = "Please enter a valid 6-digit pincode";
        break;
      case 3: // Contact Information
        if (!form.contactName.trim()) newErrors.contactName = "Contact name is required";
        if (!form.contactPhone.trim()) newErrors.contactPhone = "Contact phone is required";
        else if (!/^\d{10}$/.test(form.contactPhone.replace(/\D/g, ''))) newErrors.contactPhone = "Please enter a valid 10-digit phone number";
        if (!form.contactEmail.trim()) newErrors.contactEmail = "Contact email is required";
        else if (!/\S+@\S+\.\S+/.test(form.contactEmail)) newErrors.contactEmail = "Please enter a valid email address";
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const resetForm = () => {
    setForm({
      title: "",
      location: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      price: "",
      bedrooms: 1,
      bathrooms: 1,
      area: "",
      furnished: "Furnished",
      image: "",
      description: "",
      contactName: "",
      contactPhone: "",
      contactEmail: ""
    });
    setCurrentStep(1);
    setErrors({});
    setShowForm(false);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all steps before submission
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      alert("Please fill in all required fields correctly.");
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare form data with proper types
      const formData = {
        ...form,
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        area: Number(form.area),
        price: form.price.toString(),
        createdBy: localStorage.getItem('userEmail') || 'anonymous'
      };

      const res = await fetch('/api/flats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to create flat listing');
      
      // Success feedback
      alert("🎉 Flat listing created successfully! Redirecting to home page...");
      setFlats([data.flat, ...flats]);
      resetForm();
      
      // Redirect to home page to see the new listing
      setTimeout(() => {
        navigate("/");
      }, 1000);
      
    } catch (err) {
      console.error('Error creating flat listing:', err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // No longer fetch or display flats here

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto py-10 px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-4 tracking-tight">
            🏠 Create Your Flat Listing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            List your property with detailed information to attract the right tenants. Our step-by-step process makes it easy!
          </p>
        </div>

        {/* Create Button */}
        <div className="flex justify-center mb-8">
          <button
            className={`px-8 py-4 rounded-full font-bold shadow-lg transition-all duration-300 text-lg flex items-center gap-3 ${
              showForm 
                ? "bg-red-500 hover:bg-red-600 text-white" 
                : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transform hover:scale-105"
            }`}
            onClick={() => showForm ? resetForm() : setShowForm(true)}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating Listing...
              </>
            ) : showForm ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Flat Listing
              </>
            )}
          </button>
        </div>

        {/* Multi-Step Form */}
        {showForm && (
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Progress Steps */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6">
              <div className="flex items-center justify-between max-w-md mx-auto">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      currentStep >= step 
                        ? 'bg-white text-blue-600 shadow-lg' 
                        : 'bg-blue-400 text-white'
                    }`}>
                      {currentStep > step ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        step
                      )}
                    </div>
                    {step < 3 && (
                      <div className={`w-16 h-1 mx-2 transition-all ${
                        currentStep > step ? 'bg-white' : 'bg-blue-400'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center mt-4">
                <h3 className="text-white text-lg font-semibold">
                  {currentStep === 1 && "Basic Property Information"}
                  {currentStep === 2 && "Location Details"}
                  {currentStep === 3 && "Contact Information"}
                </h3>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-8">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Property Title */}
                    <div className="md:col-span-2">
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a2 2 0 012-2z" />
                        </svg>
                        Property Title *
                      </label>
                      <input 
                        name="title" 
                        value={form.title} 
                        onChange={handleChange} 
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors.title ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        placeholder="e.g., Spacious 2BHK Apartment in Central Location"
                        required 
                      />
                      {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    {/* Price */}
                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        Monthly Rent (₹) *
                      </label>
                      <input 
                        name="price" 
                        type="text"
                        value={form.price} 
                        onChange={handleChange} 
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors.price ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        placeholder="e.g., ₹25,000 or 25000"
                        required 
                      />
                      {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                    </div>

                    {/* Furnished Status */}
                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        </svg>
                        Furnishing Status *
                      </label>
                      <select 
                        name="furnished" 
                        value={form.furnished} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                        required
                      >
                        <option value="Furnished">Fully Furnished</option>
                        <option value="Semi-Furnished">Semi-Furnished</option>
                        <option value="Unfurnished">Unfurnished</option>
                      </select>
                    </div>

                    {/* Bedrooms */}
                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        </svg>
                        Bedrooms *
                      </label>
                      <select 
                        name="bedrooms" 
                        value={form.bedrooms} 
                        onChange={handleChange} 
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors.bedrooms ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        required
                      >
                        {[1, 2, 3, 4, 5].map(num => (
                          <option key={num} value={num}>{num} Bedroom{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                      {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms}</p>}
                    </div>

                    {/* Bathrooms */}
                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                        Bathrooms *
                      </label>
                      <select 
                        name="bathrooms" 
                        value={form.bathrooms} 
                        onChange={handleChange} 
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors.bathrooms ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        required
                      >
                        {[1, 2, 3, 4].map(num => (
                          <option key={num} value={num}>{num} Bathroom{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                      {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>}
                    </div>

                    {/* Area */}
                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        Area (sq ft) *
                      </label>
                      <input 
                        name="area" 
                        type="number"
                        value={form.area} 
                        onChange={handleChange} 
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors.area ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        placeholder="e.g., 1200"
                        min="1"
                        required 
                      />
                      {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
                    </div>

                    {/* Image URL */}
                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Property Image URL
                      </label>
                      <input 
                        name="image" 
                        type="url"
                        value={form.image} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="https://example.com/property-image.jpg"
                      />
                      <p className="text-gray-500 text-sm mt-1">Optional: Add a photo URL to showcase your property</p>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Property Description *
                      </label>
                      <textarea 
                        name="description" 
                        value={form.description} 
                        onChange={handleChange} 
                        rows={4}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                          errors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        placeholder="Describe your property in detail - amenities, nearby facilities, special features, etc."
                        required 
                      />
                      {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Location Details */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Address */}
                    <div className="md:col-span-2">
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Full Address *
                      </label>
                      <textarea 
                        name="address" 
                        value={form.address} 
                        onChange={handleChange} 
                        rows={3}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                          errors.address ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        placeholder="Complete address including building name, street, landmarks"
                        required 
                      />
                      {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                    </div>

                    {/* Location/Area */}
                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Area/Locality *
                      </label>
                      <input 
                        name="location" 
                        value={form.location} 
                        onChange={handleChange} 
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors.location ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        placeholder="e.g., Koramangala, Indiranagar"
                        required 
                      />
                      {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                    </div>

                    {/* City */}
                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        City *
                      </label>
                      <input 
                        name="city" 
                        value={form.city} 
                        onChange={handleChange} 
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors.city ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        placeholder="e.g., Bangalore"
                        required 
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>

                    {/* State */}
                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        State *
                      </label>
                      <input 
                        name="state" 
                        value={form.state} 
                        onChange={handleChange} 
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors.state ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        placeholder="e.g., Karnataka"
                        required 
                      />
                      {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                    </div>

                    {/* Pincode */}
                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        Pincode *
                      </label>
                      <input 
                        name="pincode" 
                        value={form.pincode} 
                        onChange={handleChange} 
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors.pincode ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        placeholder="e.g., 560095"
                        maxLength="6"
                        pattern="[0-9]{6}"
                        required 
                      />
                      {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Contact Information */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Name */}
                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Contact Person Name *
                      </label>
                      <input 
                        name="contactName" 
                        value={form.contactName} 
                        onChange={handleChange} 
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors.contactName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        placeholder="Your full name"
                        required 
                      />
                      {errors.contactName && <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>}
                    </div>

                    {/* Contact Phone */}
                    <div>
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Phone Number *
                      </label>
                      <input 
                        name="contactPhone" 
                        type="tel"
                        value={form.contactPhone} 
                        onChange={handleChange} 
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors.contactPhone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        placeholder="9876543210"
                        maxLength="15"
                        required 
                      />
                      {errors.contactPhone && <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>}
                    </div>

                    {/* Contact Email */}
                    <div className="md:col-span-2">
                      <label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email Address *
                      </label>
                      <input 
                        name="contactEmail" 
                        type="email"
                        value={form.contactEmail} 
                        onChange={handleChange} 
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors.contactEmail ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        placeholder="your.email@example.com"
                        required 
                      />
                      {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
                    </div>
                  </div>

                  {/* Summary Preview */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Listing Preview
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Property:</span>
                        <span className="ml-2">{form.title || "Not specified"}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Price:</span>
                        <span className="ml-2">{form.price || "Not specified"}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Location:</span>
                        <span className="ml-2">{form.location ? `${form.location}, ${form.city}` : "Not specified"}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Configuration:</span>
                        <span className="ml-2">{form.bedrooms}BHK, {form.area} sq ft</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Create Listing
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Empty State */}
        {!showForm && (
          <div className="text-center py-12">
            <div className="bg-white rounded-3xl shadow-lg p-12 max-w-2xl mx-auto border border-gray-200">
              <div className="text-6xl mb-6">🏠</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready to List Your Property?</h3>
              <p className="text-gray-600 text-lg mb-6">
                Create a comprehensive listing with all the details potential tenants need to make an informed decision.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-4">
                  <div className="text-3xl mb-2">📝</div>
                  <h4 className="font-semibold text-gray-800">Detailed Form</h4>
                  <p className="text-sm text-gray-600">Step-by-step process to capture all property details</p>
                </div>
                <div className="p-4">
                  <div className="text-3xl mb-2">✅</div>
                  <h4 className="font-semibold text-gray-800">Smart Validation</h4>
                  <p className="text-sm text-gray-600">Real-time validation ensures quality listings</p>
                </div>
                <div className="p-4">
                  <div className="text-3xl mb-2">🚀</div>
                  <h4 className="font-semibold text-gray-800">Instant Publishing</h4>
                  <p className="text-sm text-gray-600">Your listing goes live immediately after creation</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlatListings;
