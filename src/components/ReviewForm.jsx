import React, { useState } from 'react';
import StarRating from './StarRating';

const ReviewForm = ({ 
  flatId, 
  onReviewSubmitted, 
  onCancel,
  existingReview = null 
}) => {
  const [reviewData, setReviewData] = useState({
    reviewerName: existingReview?.reviewerName || '',
    reviewerEmail: existingReview?.reviewerEmail || '',
    rating: existingReview?.rating || 5,
    comment: existingReview?.comment || '',
    // Enhanced review categories
    cleanlinessRating: existingReview?.cleanlinessRating || 5,
    locationRating: existingReview?.locationRating || 5,
    valueForMoneyRating: existingReview?.valueForMoneyRating || 5,
    landlordRating: existingReview?.landlordRating || 5,
    // Additional fields
    wouldRecommend: existingReview?.wouldRecommend || true,
    stayDuration: existingReview?.stayDuration || '',
    pros: existingReview?.pros || '',
    cons: existingReview?.cons || '',
    photos: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!reviewData.reviewerName.trim()) {
      newErrors.reviewerName = 'Name is required';
    }

    if (!reviewData.reviewerEmail.trim()) {
      newErrors.reviewerEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(reviewData.reviewerEmail)) {
      newErrors.reviewerEmail = 'Please enter a valid email';
    }

    if (!reviewData.comment.trim()) {
      newErrors.comment = 'Review comment is required';
    } else if (reviewData.comment.trim().length < 10) {
      newErrors.comment = 'Review must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const method = existingReview ? 'PUT' : 'POST';
      const url = existingReview 
        ? `/api/flats/${flatId}/reviews/${existingReview._id}`
        : `/api/flats/${flatId}/reviews`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...reviewData,
          // Calculate overall rating as average of category ratings
          rating: Math.round((
            reviewData.rating +
            reviewData.cleanlinessRating +
            reviewData.locationRating +
            reviewData.valueForMoneyRating +
            reviewData.landlordRating
          ) / 5)
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(existingReview ? 'Review updated successfully!' : 'Review submitted successfully!');
        onReviewSubmitted?.(data);
      } else {
        const error = await response.json();
        alert(error.message || 'Error submitting review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setReviewData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        {existingReview ? 'Edit Your Review' : 'Write a Review'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              value={reviewData.reviewerName}
              onChange={(e) => handleInputChange('reviewerName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.reviewerName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
            />
            {errors.reviewerName && (
              <p className="text-red-500 text-sm mt-1">{errors.reviewerName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Email *
            </label>
            <input
              type="email"
              value={reviewData.reviewerEmail}
              onChange={(e) => handleInputChange('reviewerEmail', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.reviewerEmail ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
            />
            {errors.reviewerEmail && (
              <p className="text-red-500 text-sm mt-1">{errors.reviewerEmail}</p>
            )}
          </div>
        </div>

        {/* Rating Categories */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-gray-800 mb-3">Rate Different Aspects</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating
              </label>
              <StarRating
                rating={reviewData.rating}
                onRatingChange={(rating) => handleInputChange('rating', rating)}
                size="medium"
                showLabel={true}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cleanliness
              </label>
              <StarRating
                rating={reviewData.cleanlinessRating}
                onRatingChange={(rating) => handleInputChange('cleanlinessRating', rating)}
                size="medium"
                showLabel={true}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <StarRating
                rating={reviewData.locationRating}
                onRatingChange={(rating) => handleInputChange('locationRating', rating)}
                size="medium"
                showLabel={true}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value for Money
              </label>
              <StarRating
                rating={reviewData.valueForMoneyRating}
                onRatingChange={(rating) => handleInputChange('valueForMoneyRating', rating)}
                size="medium"
                showLabel={true}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Landlord/Owner
              </label>
              <StarRating
                rating={reviewData.landlordRating}
                onRatingChange={(rating) => handleInputChange('landlordRating', rating)}
                size="medium"
                showLabel={true}
              />
            </div>
          </div>
        </div>

        {/* Stay Duration */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            How long did you stay? (Optional)
          </label>
          <select
            value={reviewData.stayDuration}
            onChange={(e) => handleInputChange('stayDuration', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select duration</option>
            <option value="1-3 months">1-3 months</option>
            <option value="3-6 months">3-6 months</option>
            <option value="6-12 months">6-12 months</option>
            <option value="1+ years">1+ years</option>
            <option value="Visited only">Visited only</option>
          </select>
        </div>

        {/* Detailed Review */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Detailed Review *
          </label>
          <textarea
            value={reviewData.comment}
            onChange={(e) => handleInputChange('comment', e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              errors.comment ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Share your detailed experience with this property..."
          />
          {errors.comment && (
            <p className="text-red-500 text-sm mt-1">{errors.comment}</p>
          )}
        </div>

        {/* Pros and Cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What did you like? (Pros)
            </label>
            <textarea
              value={reviewData.pros}
              onChange={(e) => handleInputChange('pros', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="List the positive aspects..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What could be improved? (Cons)
            </label>
            <textarea
              value={reviewData.cons}
              onChange={(e) => handleInputChange('cons', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="List areas for improvement..."
            />
          </div>
        </div>

        {/* Recommendation */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Would you recommend this property?
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={reviewData.wouldRecommend === true}
                onChange={() => handleInputChange('wouldRecommend', true)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-green-600 font-medium">Yes, I recommend it</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={reviewData.wouldRecommend === false}
                onChange={() => handleInputChange('wouldRecommend', false)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-red-600 font-medium">No, I don't recommend it</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {existingReview ? 'Update Review' : 'Submit Review'}
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
