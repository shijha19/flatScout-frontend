import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function FlatDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flat, setFlat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    reviewerName: '',
    reviewerEmail: '',
    rating: 5,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    // Fetch flat details
    fetch(`/api/flats/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Flat not found");
        return res.json();
      })
      .then(data => {
        setFlat(data.flat || data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });

    // Fetch reviews
    fetchReviews();
  }, [id]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/flats/${id}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        if (flat) {
          setFlat(prev => ({
            ...prev,
            averageRating: data.averageRating || 0,
            totalReviews: data.totalReviews || 0
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.reviewerName || !reviewForm.reviewerEmail || !reviewForm.comment) {
      alert('Please fill in all fields');
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await fetch(`/api/flats/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewForm),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Review submitted successfully!');
        setReviewForm({
          reviewerName: '',
          reviewerEmail: '',
          rating: 5,
          comment: ''
        });
        setShowReviewForm(false);
        await fetchReviews(); // Refresh reviews
        // Update flat rating info
        setFlat(prev => ({
          ...prev,
          averageRating: data.averageRating,
          totalReviews: data.totalReviews
        }));
      } else {
        const error = await response.json();
        alert(error.message || 'Error submitting review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewFormChange = (e) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderStars = (rating, size = 'text-lg') => {
    return [...Array(5)].map((_, i) => (
      <span 
        key={i} 
        className={`${size} ${
          i < Math.floor(rating) 
            ? 'text-yellow-400' 
            : i === Math.floor(rating) && rating % 1 >= 0.5
            ? 'text-yellow-300'
            : 'text-gray-300'
        }`}
      >
        ⭐
      </span>
    ));
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (error) return <div className="text-center text-red-500 mt-20">{error} (ID: {id})</div>;
  if (!flat || (!flat._id && !flat.title)) {
    return <div className="text-center text-gray-400 mt-20">Flat not found for ID: {id}</div>;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header Navigation */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <button 
              onClick={() => navigate(-1)} 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Listings
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Property Image Header */}
            {flat.image && (
              <div className="relative h-96 bg-gray-200">
                <img 
                  src={flat.image} 
                  alt={flat.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            )}

            <div className="p-8 lg:p-12">
              {/* Property Title & Location */}
              <div className="mb-8">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  {flat.title}
                </h1>
                
                <div className="flex items-center text-gray-600 mb-4">
                  <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-lg">{flat.location}, {flat.city}, {flat.state} {flat.pincode}</span>
                </div>

                <p className="text-gray-600 text-base leading-relaxed max-w-3xl">
                  {flat.address}
                </p>
              </div>

              {/* Price & Key Features */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Price Section */}
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
                    <div className="text-sm font-semibold text-emerald-800 uppercase tracking-wide mb-2">
                      Monthly Rent
                    </div>
                    <div className="text-3xl font-bold text-emerald-900">
                      ₹{flat.price?.toLocaleString() || flat.price}
                    </div>
                  </div>
                </div>

                {/* Property Features */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="text-2xl font-bold text-blue-900 mb-1">{flat.bedrooms}</div>
                      <div className="text-sm font-medium text-blue-700">Bedrooms</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-xl">
                      <div className="text-2xl font-bold text-purple-900 mb-1">{flat.bathrooms}</div>
                      <div className="text-sm font-medium text-purple-700">Bathrooms</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-xl">
                      <div className="text-2xl font-bold text-orange-900 mb-1">{flat.area}</div>
                      <div className="text-sm font-medium text-orange-700">sq ft</div>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                      <div className="text-sm font-bold text-indigo-900 mb-1">{flat.furnished}</div>
                      <div className="text-sm font-medium text-indigo-700">Status</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating & Reviews Section */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    {flat.averageRating > 0 ? (
                      <>
                        <div className="flex items-center gap-2">
                          {renderStars(flat.averageRating, 'text-xl')}
                          <span className="text-xl font-bold text-gray-900">
                            {flat.averageRating}/5
                          </span>
                        </div>
                        <div className="h-6 w-px bg-gray-300" />
                        <span className="text-gray-600 font-medium">
                          {flat.totalReviews || 0} review{(flat.totalReviews || 0) !== 1 ? 's' : ''}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-600 italic">No ratings yet - Be the first to review!</span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {showReviewForm ? 'Cancel Review' : 'Write Review'}
                  </button>
                </div>
              </div>

              {/* Property Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Property</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {flat.description}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t border-gray-200 pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{flat.contactName}</h3>
                          <p className="text-gray-600">Property Owner</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-gray-700 font-medium">{flat.contactPhone}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-gray-700 font-medium">{flat.contactEmail}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center lg:justify-end">
                      <a 
                        href={`tel:${flat.contactPhone}`} 
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Call Now
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Write a Review</h3>
              </div>
              
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="reviewerName"
                      value={reviewForm.reviewerName}
                      onChange={handleReviewFormChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="reviewerEmail"
                      value={reviewForm.reviewerEmail}
                      onChange={handleReviewFormChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Your Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="rating"
                      value={reviewForm.rating}
                      onChange={handleReviewFormChange}
                      className="w-full md:w-64 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                    >
                      {[5, 4, 3, 2, 1].map(num => (
                        <option key={num} value={num}>
                          {num} Star{num !== 1 ? 's' : ''} - {
                            num === 5 ? 'Excellent' :
                            num === 4 ? 'Very Good' :
                            num === 3 ? 'Average' :
                            num === 2 ? 'Poor' : 'Terrible'
                          }
                        </option>
                      ))}
                    </select>
                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Your Review <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="comment"
                    value={reviewForm.comment}
                    onChange={handleReviewFormChange}
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Share your experience with this property. What did you like? What could be improved?"
                    required
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="inline-flex items-center justify-center gap-3 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
                  >
                    {submittingReview ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Submit Review
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="inline-flex items-center justify-center gap-3 px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews Display */}
          {reviews.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Customer Reviews ({reviews.length})
                </h3>
              </div>
              
              <div className="grid gap-6">
                {reviews.map((review, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {review.reviewerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{review.reviewerName}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center">
                              {renderStars(review.rating, 'text-base')}
                            </div>
                            <span className="text-sm font-medium text-gray-600">
                              ({review.rating}/5)
                            </span>
                          </div>
                        </div>
                      </div>
                      <time className="text-sm text-gray-500 font-medium">
                        {new Date(review.reviewDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </time>
                    </div>
                    <blockquote className="text-gray-700 leading-relaxed pl-16">
                      "{review.comment}"
                    </blockquote>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
