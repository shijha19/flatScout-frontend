import React, { useState } from 'react';
import StarRating from './StarRating';

const ReviewDisplay = ({ review, onMarkHelpful, onReportReview }) => {
  const [showFullReview, setShowFullReview] = useState(false);
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false);

  const handleMarkHelpful = () => {
    if (!hasMarkedHelpful) {
      setHasMarkedHelpful(true);
      onMarkHelpful?.(review._id);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {review.reviewerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">{review.reviewerName}</h4>
              <p className="text-sm text-gray-600">{formatDate(review.reviewDate)}</p>
            </div>
            {review.verified && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                ✓ Verified
              </span>
            )}
          </div>
          
          {/* Stay Duration */}
          {review.stayDuration && (
            <p className="text-sm text-gray-600 mb-2">
              Stayed for: <span className="font-medium">{review.stayDuration}</span>
            </p>
          )}
        </div>

        {/* Overall Rating */}
        <div className="text-right">
          <StarRating 
            rating={review.rating} 
            size="small" 
            showLabel={false}
            disabled={true}
          />
          <p className="text-sm text-gray-600 mt-1">
            {review.rating}/5 overall
          </p>
        </div>
      </div>

      {/* Category Ratings */}
      {(review.cleanlinessRating || review.locationRating || review.valueForMoneyRating || review.landlordRating) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-semibold text-gray-700 mb-2">Category Ratings</h5>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {review.cleanlinessRating && (
              <div className="flex justify-between">
                <span className="text-gray-600">Cleanliness:</span>
                <StarRating rating={review.cleanlinessRating} size="small" showLabel={false} disabled={true} />
              </div>
            )}
            {review.locationRating && (
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <StarRating rating={review.locationRating} size="small" showLabel={false} disabled={true} />
              </div>
            )}
            {review.valueForMoneyRating && (
              <div className="flex justify-between">
                <span className="text-gray-600">Value:</span>
                <StarRating rating={review.valueForMoneyRating} size="small" showLabel={false} disabled={true} />
              </div>
            )}
            {review.landlordRating && (
              <div className="flex justify-between">
                <span className="text-gray-600">Landlord:</span>
                <StarRating rating={review.landlordRating} size="small" showLabel={false} disabled={true} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendation */}
      {review.wouldRecommend !== undefined && (
        <div className="mb-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            review.wouldRecommend 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {review.wouldRecommend ? (
              <>
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Recommends
              </>
            ) : (
              <>
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Doesn't Recommend
              </>
            )}
          </span>
        </div>
      )}

      {/* Main Review Comment */}
      <div className="mb-4">
        <p className="text-gray-800 leading-relaxed">
          {showFullReview ? review.comment : truncateText(review.comment)}
          {review.comment && review.comment.length > 150 && (
            <button
              onClick={() => setShowFullReview(!showFullReview)}
              className="text-blue-600 hover:text-blue-700 ml-2 font-medium text-sm"
            >
              {showFullReview ? 'Show less' : 'Read more'}
            </button>
          )}
        </p>
      </div>

      {/* Pros and Cons */}
      {(review.pros || review.cons) && (
        <div className="mb-4 space-y-2">
          {review.pros && (
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-medium text-sm">👍 Pros:</span>
              <p className="text-sm text-gray-700 flex-1">{review.pros}</p>
            </div>
          )}
          {review.cons && (
            <div className="flex items-start gap-2">
              <span className="text-red-600 font-medium text-sm">👎 Cons:</span>
              <p className="text-sm text-gray-700 flex-1">{review.cons}</p>
            </div>
          )}
        </div>
      )}

      {/* Review Photos */}
      {review.photos && review.photos.length > 0 && (
        <div className="mb-4">
          <h6 className="text-sm font-medium text-gray-700 mb-2">Photos from reviewer:</h6>
          <div className="flex gap-2 overflow-x-auto">
            {review.photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Review photo ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0"
              />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <button
          onClick={handleMarkHelpful}
          disabled={hasMarkedHelpful}
          className={`flex items-center gap-2 text-sm transition-colors ${
            hasMarkedHelpful 
              ? 'text-green-600 cursor-default' 
              : 'text-gray-600 hover:text-green-600 cursor-pointer'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          <span>
            {hasMarkedHelpful ? 'Marked helpful' : 'Helpful'} 
            {review.helpfulVotes > 0 && ` (${review.helpfulVotes})`}
          </span>
        </button>

        <button
          onClick={() => onReportReview?.(review._id)}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          Report
        </button>
      </div>
    </div>
  );
};

export default ReviewDisplay;
