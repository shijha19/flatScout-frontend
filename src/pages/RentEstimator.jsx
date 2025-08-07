import React, { useState } from 'react';
import { FaInfoCircle, FaCheckCircle, FaSave, FaRedo, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const RentEstimator = () => {
  const [formData, setFormData] = useState({
    location: '',
    propertyType: 'apartment',
    bedrooms: '1',
    bathrooms: '1',
    area: '',
    furnishing: 'unfurnished',
    amenities: [],
    floor: '',
    age: '',
    nearbyTransport: false,
    nearbySchools: false,
    nearbyHospitals: false,
    nearbyMalls: false
  });

  const [estimatedRent, setEstimatedRent] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'Independent House' },
    { value: 'villa', label: 'Villa' },
    { value: 'studio', label: 'Studio' },
    { value: 'duplex', label: 'Duplex' },
    { value: 'penthouse', label: 'Penthouse' }
  ];

  const furnishingOptions = [
    { value: 'unfurnished', label: 'Unfurnished' },
    { value: 'semi-furnished', label: 'Semi-Furnished' },
    { value: 'fully-furnished', label: 'Fully Furnished' }
  ];

  const amenityOptions = [
    'Parking', 'Gym', 'Swimming Pool', 'Security', 'Lift', 'Power Backup',
    'Water Supply', 'Garden', 'Club House', 'Children Play Area', 'AC', 'Balcony'
  ];

  const handleAmenityChange = (amenity) => {
    const updatedAmenities = formData.amenities.includes(amenity)
      ? formData.amenities.filter(a => a !== amenity)
      : [...formData.amenities, amenity];
    
    setFormData({ ...formData, amenities: updatedAmenities });
  };

  // Store breakdown for details
  const [breakdown, setBreakdown] = useState(null);

  const calculateRent = async () => {
    setIsCalculating(true);
    
    try {
      // Mock calculation - in real app, this would call an API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Base rent calculation (simplified)
      let baseRent = 10000; // Base rent
      let breakdownObj = { base: 10000 };

      // Location factor (mock data)
      const locationMultipliers = {
        'mumbai': 2.5,
        'delhi': 2.2,
        'bangalore': 2.0,
        'pune': 1.8,
        'chennai': 1.7,
        'hyderabad': 1.6,
        'kolkata': 1.4,
        'ahmedabad': 1.3,
        'jaipur': 1.2,
        'indore': 1.1
      };
      const locationKey = formData.location.toLowerCase();
      const locationMultiplier = locationMultipliers[locationKey] || 1.0;
      baseRent *= locationMultiplier;
      breakdownObj.location = locationMultiplier;

      // Property type factor
      const typeMultipliers = {
        'studio': 0.7,
        'apartment': 1.0,
        'duplex': 1.3,
        'house': 1.4,
        'villa': 1.8,
        'penthouse': 2.5
      };
      baseRent *= typeMultipliers[formData.propertyType];
      breakdownObj.type = typeMultipliers[formData.propertyType];

      // Bedroom factor
      baseRent *= parseInt(formData.bedrooms) * 0.8;
      breakdownObj.bedrooms = parseInt(formData.bedrooms) * 0.8;

      // Area factor
      if (formData.area) {
        baseRent *= (parseInt(formData.area) / 1000);
        breakdownObj.area = parseInt(formData.area) / 1000;
      } else {
        breakdownObj.area = 1;
      }

      // Furnishing factor
      const furnishingMultipliers = {
        'unfurnished': 1.0,
        'semi-furnished': 1.2,
        'fully-furnished': 1.5
      };
      baseRent *= furnishingMultipliers[formData.furnishing];
      breakdownObj.furnishing = furnishingMultipliers[formData.furnishing];

      // Amenities factor
      baseRent += formData.amenities.length * 500;
      breakdownObj.amenities = formData.amenities.length * 500;

      // Nearby facilities bonus
      let facilitiesBonus = 0;
      if (formData.nearbyTransport) facilitiesBonus += 1000;
      if (formData.nearbySchools) facilitiesBonus += 800;
      if (formData.nearbyHospitals) facilitiesBonus += 600;
      if (formData.nearbyMalls) facilitiesBonus += 400;
      baseRent += facilitiesBonus;
      breakdownObj.facilities = facilitiesBonus;

      // Age depreciation
      let ageDep = 1;
      if (formData.age) {
        const ageYears = parseInt(formData.age);
        if (ageYears > 10) {
          baseRent *= 0.9;
          ageDep = 0.9;
        } else if (ageYears > 5) {
          baseRent *= 0.95;
          ageDep = 0.95;
        }
      }
      breakdownObj.age = ageDep;

      const finalRent = Math.round(baseRent);
      const range = {
        min: Math.round(finalRent * 0.85),
        max: Math.round(finalRent * 1.15)
      };

      setEstimatedRent({ estimated: finalRent, range });
      setBreakdown(breakdownObj);
    } catch (error) {
      console.error('Error calculating rent:', error);
      alert('Error calculating rent estimate. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateRent();
  };

  const handleReset = () => {
    setFormData({
      location: '',
      propertyType: 'apartment',
      bedrooms: '1',
      bathrooms: '1',
      area: '',
      furnishing: 'unfurnished',
      amenities: [],
      floor: '',
      age: '',
      nearbyTransport: false,
      nearbySchools: false,
      nearbyHospitals: false,
      nearbyMalls: false
    });
    setEstimatedRent(null);
    setBreakdown(null);
    setShowDetails(false);
  };

  const handleSaveEstimate = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Toast for save */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded shadow-lg flex items-center animate-bounce-in">
          <FaCheckCircle className="mr-2" /> Estimate saved!
        </div>
      )}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <span>Rent Estimator</span>
              <FaInfoCircle className="text-blue-500" title="Estimate rent based on your property details" />
            </h1>
            <p className="text-gray-600">Get an estimated rental value for your property based on location and features</p>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <button type="button" onClick={handleReset} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 border border-gray-300 transition-colors" title="Reset form">
              <FaRedo className="mr-1" /> Reset
            </button>
            <button type="button" onClick={handleSaveEstimate} disabled={!estimatedRent} className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors" title="Save estimate">
              <FaSave className="mr-1" /> Save Estimate
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-1">
                      Location * <FaInfoCircle className="text-blue-400" title="Enter your city (e.g. Mumbai, Delhi)" />
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                      placeholder="Enter city or area"
                    />
                  </div>

                  <div>
                    <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-1">
                      Property Type * <FaInfoCircle className="text-blue-400" title="Select the type of property" />
                    </label>
                    <select
                      value={formData.propertyType}
                      onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {propertyTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-1">
                      Bedrooms * <FaInfoCircle className="text-blue-400" title="Number of bedrooms (BHK)" />
                    </label>
                    <select
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[1,2,3,4,5].map(num => (
                        <option key={num} value={num}>{num} BHK</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-1">
                      Bathrooms * <FaInfoCircle className="text-blue-400" title="Number of bathrooms" />
                    </label>
                    <select
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({...formData, bathrooms: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[1,2,3,4].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-1">
                      Area (sq ft) <FaInfoCircle className="text-blue-400" title="Carpet area in square feet" />
                    </label>
                    <input
                      type="number"
                      value={formData.area}
                      onChange={(e) => setFormData({...formData, area: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter area"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-1">
                      Furnishing Status * <FaInfoCircle className="text-blue-400" title="Level of furnishing" />
                    </label>
                    <select
                      value={formData.furnishing}
                      onChange={(e) => setFormData({...formData, furnishing: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {furnishingOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      Property Age (years) <FaInfoCircle className="text-blue-400" title="How old is the property?" />
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter age in years"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex text-sm font-medium text-gray-700 mb-3 items-center gap-1">
                    Amenities <FaInfoCircle className="text-blue-400" title="Select amenities available" />
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenityOptions.map(amenity => (
                      <label key={amenity} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityChange(amenity)}
                          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex text-sm font-medium text-gray-700 mb-3 items-center gap-1">
                    Nearby Facilities <FaInfoCircle className="text-blue-400" title="Tick if available nearby" />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.nearbyTransport}
                        onChange={(e) => setFormData({...formData, nearbyTransport: e.target.checked})}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Public Transport</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.nearbySchools}
                        onChange={(e) => setFormData({...formData, nearbySchools: e.target.checked})}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Schools</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.nearbyHospitals}
                        onChange={(e) => setFormData({...formData, nearbyHospitals: e.target.checked})}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Hospitals</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.nearbyMalls}
                        onChange={(e) => setFormData({...formData, nearbyMalls: e.target.checked})}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Shopping Malls</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 items-center">
                  <button
                    type="submit"
                    disabled={isCalculating}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isCalculating ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                        </svg>
                        Calculating...
                      </>
                    ) : 'Estimate Rent'}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 border border-gray-300 transition-colors flex items-center gap-1"
                  >
                    <FaRedo /> Reset
                  </button>
                </div>
              </form>
            </div>

            {/* Results */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 shadow-md animate-fade-in">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <FaInfoCircle className="text-blue-400" /> Rent Estimate
                </h3>
                {estimatedRent ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-extrabold text-blue-700 flex items-center justify-center gap-2 animate-bounce-in">
                        ₹{estimatedRent.estimated.toLocaleString()}
                        <FaCheckCircle className="text-green-500" />
                      </div>
                      <div className="text-sm text-gray-600">per month</div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="text-sm text-gray-700 mb-2">Expected Range:</div>
                      <div className="flex justify-between text-sm">
                        <span className="bg-green-50 px-2 py-1 rounded">Min: ₹{estimatedRent.range.min.toLocaleString()}</span>
                        <span className="bg-red-50 px-2 py-1 rounded">Max: ₹{estimatedRent.range.max.toLocaleString()}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="flex items-center gap-1 text-blue-700 hover:underline text-sm mt-2"
                      onClick={() => setShowDetails(v => !v)}
                    >
                      {showDetails ? <FaChevronUp /> : <FaChevronDown />} Show Details
                    </button>
                    {showDetails && breakdown && (
                      <div className="bg-white border border-blue-200 rounded p-3 text-xs text-gray-700 animate-fade-in">
                        <div className="mb-1"><strong>Breakdown:</strong></div>
                        <ul className="space-y-1">
                          <li>Base Rent: <span className="font-semibold">₹{breakdown.base}</span></li>
                          <li>Location Multiplier: <span className="font-semibold">x{breakdown.location}</span></li>
                          <li>Type Multiplier: <span className="font-semibold">x{breakdown.type}</span></li>
                          <li>Bedrooms Factor: <span className="font-semibold">x{breakdown.bedrooms}</span></li>
                          <li>Area Factor: <span className="font-semibold">x{breakdown.area}</span></li>
                          <li>Furnishing: <span className="font-semibold">x{breakdown.furnishing}</span></li>
                          <li>Amenities Bonus: <span className="font-semibold">+₹{breakdown.amenities}</span></li>
                          <li>Nearby Facilities Bonus: <span className="font-semibold">+₹{breakdown.facilities}</span></li>
                          <li>Age Depreciation: <span className="font-semibold">x{breakdown.age}</span></li>
                        </ul>
                      </div>
                    )}
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-4 animate-fade-in">
                      <div className="text-xs text-yellow-800">
                        <strong>Note:</strong> This is an estimated value based on the provided information. Actual rental prices may vary based on market conditions, exact location, and other factors.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 animate-fade-in">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p>Fill out the form to get your rent estimate</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Animations (add to global CSS or Tailwind config for real projects)
// .animate-fade-in { animation: fadeIn 0.5s; }
// .animate-bounce-in { animation: bounceIn 0.7s; }
// @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
// @keyframes bounceIn { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); } }

export default RentEstimator;
