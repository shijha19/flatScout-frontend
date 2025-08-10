import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Heart, Star, Plus, X, Tag, Calendar, MoreHorizontal } from 'lucide-react';

const WishlistButton = ({ 
  itemType, 
  itemId, 
  initialStatus = { isInWishlist: false }, 
  size = 'md',
  showText = false,
  onStatusChange,
  className = '' 
}) => {
  const [isInWishlist, setIsInWishlist] = useState(initialStatus.isInWishlist);
  const [category, setCategory] = useState(initialStatus.category);
  const [loading, setLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  useEffect(() => {
    checkWishlistStatus();
  }, [itemId, itemType]);

  const checkWishlistStatus = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) return;

      const response = await fetch(`/api/wishlist/check/${itemType}/${itemId}?userEmail=${encodeURIComponent(userEmail)}`);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsInWishlist(data.data.isInWishlist);
          setCategory(data.data.category);
        }
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleToggleWishlist = async (targetCategory = 'favorites') => {
    setLoading(true);
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        alert('Please login to use wishlist');
        return;
      }

      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch('/api/wishlist/remove', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            itemType,
            itemId,
            userEmail
          })
        });

        if (response.ok) {
          setIsInWishlist(false);
          setCategory(null);
          onStatusChange?.({ isInWishlist: false, category: null });
        } else {
          const error = await response.json();
          console.error('Remove from wishlist failed:', error);
          alert('Failed to remove from wishlist: ' + (error.message || 'Unknown error'));
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/wishlist/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            itemType,
            itemId,
            category: targetCategory,
            userEmail
          })
        });

        if (response.ok) {
          setIsInWishlist(true);
          setCategory(targetCategory);
          onStatusChange?.({ isInWishlist: true, category: targetCategory });
        } else {
          const error = await response.json();
          console.error('Add to wishlist failed:', error);
          alert('Failed to add to wishlist: ' + (error.message || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert('Failed to update wishlist');
    } finally {
      setLoading(false);
      setShowQuickActions(false);
    }
  };

  const getCategoryColor = (cat) => {
    const colors = {
      favorites: 'text-red-500',
      maybe: 'text-yellow-500',
      contacted: 'text-blue-500',
      visited: 'text-green-500',
      applied: 'text-purple-500'
    };
    return colors[cat] || 'text-gray-500';
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'favorites': return <Heart size={iconSizes[size]} className="fill-current" />;
      case 'maybe': return <Star size={iconSizes[size]} className="fill-current" />;
      default: return <Heart size={iconSizes[size]} className="fill-current" />;
    }
  };

  if (showQuickActions) {
    const menu = (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10" onClick={() => setShowQuickActions(false)}>
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-56 relative" onClick={e => e.stopPropagation()}>
          <div className="text-xs text-gray-600 mb-2">Add to category:</div>
          <div className="space-y-1">
            {['favorites', 'maybe', 'contacted', 'visited', 'applied'].map(cat => (
              <button
                key={cat}
                onClick={() => handleToggleWishlist(cat)}
                className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 flex items-center gap-2"
                disabled={loading}
              >
                <div className={`w-3 h-3 rounded-full ${getCategoryColor(cat).replace('text-', 'bg-')}`} />
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowQuickActions(false)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
    return typeof document !== 'undefined' && document.body ? createPortal(menu, document.body) : menu;
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent parent click events
          if (isInWishlist) {
            handleToggleWishlist();
          } else {
            setShowQuickActions(true);
          }
        }}
        disabled={loading}
        className={`
          ${sizeClasses[size]} 
          ${isInWishlist ? getCategoryColor(category) : 'text-gray-400 hover:text-red-500'} 
          transition-colors duration-200 flex items-center justify-center
          ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${showText ? 'gap-2' : ''}
        `}
        title={isInWishlist ? `In ${category}` : 'Add to wishlist'}
      >
        {loading ? (
          <div className="animate-spin rounded-full border-2 border-current border-t-transparent" 
               style={{ width: iconSizes[size], height: iconSizes[size] }} />
        ) : (
          <>
            {isInWishlist ? getCategoryIcon(category) : <Heart size={iconSizes[size]} />}
            {showText && (
              <span className="text-sm">
                {isInWishlist ? 'Saved' : 'Save'}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
};

export default WishlistButton;
