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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-white flex flex-col items-center py-12 px-4">
        <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl border-2 border-pink-200 p-10">
          <button onClick={() => navigate(-1)} className="mb-8 text-base text-pink-600 hover:underline font-semibold">&larr; Back to Listings</button>
          <div className="flex flex-col md:flex-row gap-8">
            {flat.image && (
              <img src={flat.image} alt={flat.title} className="w-full md:w-80 h-64 object-cover rounded-2xl shadow mb-4 md:mb-0" />
            )}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h1 className="text-4xl font-extrabold mb-2 text-black font-sans">{flat.title}</h1>
                <div className="text-lg text-gray-700 mb-2 font-sans flex flex-wrap gap-2">
                  <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">{flat.location}</span>
                  <span className="inline-block bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-semibold">{flat.city}, {flat.state} {flat.pincode}</span>
                  <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">{flat.address}</span>
                </div>
                <div className="flex flex-wrap gap-4 mb-4 mt-2">
                  <span className="bg-pink-200 text-pink-800 px-4 py-2 rounded-full font-bold text-lg">₹{flat.price}</span>
                  <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold">{flat.bedrooms} Bed</span>
                  <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold">{flat.bathrooms} Bath</span>
                  <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold">{flat.area} sq ft</span>
                  <span className="bg-fuchsia-100 text-fuchsia-700 px-4 py-2 rounded-full font-semibold">{flat.furnished}</span>
                </div>

                {/* Rating Display */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between flex-wrap">
                    <div className="flex items-center gap-2 flex-nowrap w-full">
                      {flat.averageRating > 0 ? (
                        <>
                          <div className="flex items-center gap-2 flex-nowrap whitespace-nowrap">
                            {renderStars(flat.averageRating, 'text-xl')}
                            <span className="text-lg font-semibold text-gray-700 ml-1 whitespace-nowrap">
                              {flat.averageRating}/5
                            </span>
                            <span className="text-xl text-gray-400 mx-1">·</span>
                            <span className="text-sm text-gray-600 ml-0 whitespace-nowrap">
                              {flat.totalReviews || 0} review{(flat.totalReviews || 0) !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-500 italic">No ratings yet - Be the first to review!</span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors mt-3 md:mt-0"
                    >
                      {showReviewForm ? 'Cancel' : 'Write Review'}
                    </button>
                  </div>
                </div>

                <div className="text-gray-700 mb-6 text-base font-sans whitespace-pre-line">{flat.description}</div>
              </div>
              <div className="mt-6 border-t pt-6 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="text-gray-500 text-xs uppercase font-bold mb-1">Contact</div>
                  <div className="text-lg font-semibold text-black">{flat.contactName}</div>
                  <div className="text-gray-700">{flat.contactPhone}</div>
                  <div className="text-gray-700">{flat.contactEmail}</div>
                </div>
                <a href={`tel:${flat.contactPhone}`} className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-bold shadow transition text-lg text-center md:ml-4">Call Now</a>
              </div>
            </div>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
                    <input
                      type="text"
                      name="reviewerName"
                      value={reviewForm.reviewerName}
                      onChange={handleReviewFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Your Email</label>
                    <input
                      type="email"
                      name="reviewerEmail"
                      value={reviewForm.reviewerEmail}
                      onChange={handleReviewFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                  <select
                    name="rating"
                    value={reviewForm.rating}
                    onChange={handleReviewFormChange}
                    className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Review</label>
                  <textarea
                    name="comment"
                    value={reviewForm.comment}
                    onChange={handleReviewFormChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Share your experience with this property..."
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews Display */}
          {reviews.length > 0 && (
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Reviews ({reviews.length})
              </h3>
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-800">{review.reviewerName}</h4>
                          <div className="flex items-center">
                            {renderStars(review.rating, 'text-sm')}
                            <span className="ml-1 text-sm text-gray-600">({review.rating}/5)</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(review.reviewDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
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
