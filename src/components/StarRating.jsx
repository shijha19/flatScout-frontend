import React, { useState } from 'react';

const StarRating = ({ 
  rating = 0, 
  onRatingChange = null, 
  size = 'medium', 
  showLabel = true,
  disabled = false,
  allowHalf = false 
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(rating);

  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  const labels = {
    1: 'Terrible',
    2: 'Poor', 
    3: 'Average',
    4: 'Very Good',
    5: 'Excellent'
  };

  const handleClick = (starValue) => {
    if (disabled || !onRatingChange) return;
    
    const newRating = allowHalf && starValue === selectedRating ? starValue - 0.5 : starValue;
    setSelectedRating(newRating);
    onRatingChange(newRating);
  };

  const handleMouseEnter = (starValue) => {
    if (disabled) return;
    setHoverRating(starValue);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setHoverRating(0);
  };

  const getStarFill = (starIndex) => {
    const currentRating = hoverRating || selectedRating;
    if (currentRating >= starIndex) {
      return 'text-yellow-400';
    } else if (allowHalf && currentRating >= starIndex - 0.5) {
      return 'text-yellow-300';
    }
    return 'text-gray-300';
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${sizes[size]} ${getStarFill(star)} transition-colors duration-150 ${
              !disabled && onRatingChange ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
            }`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={disabled}
          >
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.16c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.286 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.448a1 1 0 00-1.175 0l-3.368 2.448c-.784.57-1.838-.197-1.54-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.045 9.384c-.783-.57-.38-1.81.588-1.81h4.16a1 1 0 00.95-.69l1.286-3.957z" />
            </svg>
          </button>
        ))}
      </div>
      
      {showLabel && (selectedRating > 0 || hoverRating > 0) && (
        <span className="text-sm text-gray-600 ml-2">
          {labels[Math.ceil(hoverRating || selectedRating)] || ''}
        </span>
      )}
      
      {showLabel && (selectedRating > 0) && (
        <span className="text-sm font-medium text-gray-800 ml-1">
          ({(hoverRating || selectedRating).toFixed(allowHalf ? 1 : 0)}/5)
        </span>
      )}
    </div>
  );
};

export default StarRating;
