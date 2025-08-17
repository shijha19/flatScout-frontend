import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Star, 
  Phone, 
  MapPin, 
  Filter, 
  Search, 
  MoreVertical,
  Trash2,
  Edit3,
  Bell,
  Tag,
  Grid,
  List,
  Calendar,
  RefreshCw,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  StickyNote,
  AlertCircle,
  Check,
  X,
  Users,
  Home,
  Building,
  ArrowUpDown,
  Eye,
  Copy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Helper functions
const getCategoryIcon = (category) => {
  switch (category) {
    case 'favorites': return <Heart className="w-4 h-4 text-red-500 fill-current" />;
    case 'maybe': return <Star className="w-4 h-4 text-yellow-500 fill-current" />;
    case 'contacted': return <Phone className="w-4 h-4 text-blue-500" />;
    case 'visited': return <MapPin className="w-4 h-4 text-green-500" />;
    case 'applied': return <Calendar className="w-4 h-4 text-purple-500" />;
    default: return <Heart className="w-4 h-4 text-gray-500" />;
  }
};

const getItemTypeIcon = (itemType) => {
  switch (itemType) {
    case 'flat': return <Home className="w-4 h-4 text-blue-500" />;
    case 'flatmate': return <Users className="w-4 h-4 text-green-500" />;
    case 'pg': return <Building className="w-4 h-4 text-purple-500" />;
    default: return <Home className="w-4 h-4 text-gray-500" />;
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// WishlistCard Component
const WishlistCard = ({ item, selectedItems, setSelectedItems, updateItemDetails, navigateToItem, copyItemLink, handleRemoveItem }) => {
  const [showActions, setShowActions] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [newNotes, setNewNotes] = useState(item.notes || '');

  const handleSaveNotes = () => {
    updateItemDetails(item._id, { notes: newNotes });
    setEditingNotes(false);
  };

  // Handle images based on item type
  let imageUrl;
  
  if (item.itemType === 'flat') {
    // For flats, use the image property or show default flat image
    if (item.itemSnapshot?.image || item.itemSnapshot?.imageUrl) {
      imageUrl = item.itemSnapshot.image || item.itemSnapshot.imageUrl;
    } else {
      // Default flat image placeholder
      imageUrl = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
    }
  } else if (item.itemType === 'flatmate') {
    // For flatmates, use photoUrl with fallback to generated avatar
    if (item.itemSnapshot?.photoUrl) {
      imageUrl = item.itemSnapshot.photoUrl;
    } else if (item.itemSnapshot?.name || item.itemSnapshot?.title) {
      const name = item.itemSnapshot.name || item.itemSnapshot.title;
      imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=300&background=F472B6&color=fff`;
    } else {
      imageUrl = `https://ui-avatars.com/api/?name=User&size=300&background=F472B6&color=fff`;
    }
  } else {
    // For PGs and other types, use image URL or default property image
    if (item.itemSnapshot?.imageUrl || item.itemSnapshot?.image) {
      imageUrl = item.itemSnapshot.imageUrl || item.itemSnapshot.image;
    } else {
      // Default property image for PGs
      imageUrl = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
    }
  }
  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 group">
      <div className="relative">
        <img
          src={imageUrl}
          alt={item.itemSnapshot?.title || item.itemSnapshot?.name || 'Wishlist Item'}
          className={`w-full h-48 object-cover cursor-pointer ${
            item.itemType === 'flatmate' 
              ? 'rounded-t-lg' // Keep top rounded for card structure, but we'll add special handling
              : 'rounded-t-lg'
          }`}
          onClick={() => navigateToItem(item)}
          onError={(e) => {
            if (item.itemType === 'flatmate') {
              const name = item.itemSnapshot?.name || item.itemSnapshot?.title || 'User';
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=300&background=F472B6&color=fff`;
            } else if (item.itemType === 'flat') {
              // For flats, fallback to default flat image
              e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
            } else {
              // For other property types, fallback to default property image
              e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
            }
          }}
        />
        
        {/* Priority Badge */}
        {item.priority && (
          <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
            {String(item.priority).toUpperCase()}
          </div>
        )}
        
        {/* Category Icon */}
        <div className="absolute top-2 right-8">
          {getCategoryIcon(item.category)}
        </div>
        
        {/* Selection Checkbox */}
        <div className="absolute top-2 right-2">
          <input
            type="checkbox"
            checked={selectedItems.includes(item._id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedItems([...selectedItems, item._id]);
              } else {
                setSelectedItems(selectedItems.filter(id => id !== item._id));
              }
            }}
            className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded"
          />
        </div>
        
        {/* Item Type Badge */}
        <div className="absolute bottom-2 left-2 flex items-center bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
          {getItemTypeIcon(item.itemType)}
          <span className="ml-1 text-xs font-medium capitalize">{item.itemType}</span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 cursor-pointer hover:text-blue-600"
              onClick={() => navigateToItem(item)}>
            {item.itemType === 'flatmate' 
              ? item.itemSnapshot?.name || 'Flatmate Profile'
              : item.itemSnapshot?.title || 'Property Listing'
            }
          </h3>
          <div className="relative">
            <button 
              onClick={() => setShowActions(!showActions)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {/* Action Menu */}
            {showActions && (
              <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[160px]">
                <button
                  onClick={() => {
                    setEditingNotes(true);
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                >
                  <StickyNote className="w-4 h-4 mr-2" />
                  Edit Notes
                </button>
                <button
                  onClick={() => {
                    copyItemLink(item);
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </button>
                <button
                  onClick={() => {
                    navigateToItem(item);
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Original
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => {
                    handleRemoveItem(item.itemId, item.itemType);
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2 mb-3">
          {item.itemSnapshot?.location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{item.itemSnapshot.location}</span>
            </div>
          )}
          
          {/* Display different info based on item type */}
          {item.itemType === 'flatmate' ? (
            <div className="space-y-1">
              {item.itemSnapshot?.bio && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {item.itemSnapshot.bio}
                </p>
              )}
              <div className="flex flex-wrap gap-1">
                {item.itemSnapshot?.gender && (
                  <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">
                    {item.itemSnapshot.gender}
                  </span>
                )}
                {item.itemSnapshot?.budget && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    Budget: ₹{item.itemSnapshot.budget}
                  </span>
                )}
              </div>
            </div>
          ) : (
            item.itemSnapshot?.price && (
              <div className="text-lg font-bold text-gray-900">
                ₹{item.itemSnapshot.price.toLocaleString()}
                {item.itemType === 'flat' ? '/month' : ''}
              </div>
            )
          )}
        </div>
        
        {/* Notes Section */}
        {editingNotes ? (
          <div className="mb-3">
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Add your notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
              rows="2"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  setEditingNotes(false);
                  setNewNotes(item.notes || '');
                }}
                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          item.notes && (
            <div className="mb-3 p-2 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600 line-clamp-2">
                <StickyNote className="w-3 h-3 inline mr-1" />
                {item.notes}
              </p>
            </div>
          )
        )}
        
        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{item.tags.length - 3} more
              </span>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Added {new Date(item.createdAt).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateToItem(item)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center"
            >
              <Eye className="w-3 h-3 mr-1" />
              {item.itemType === 'flatmate' ? 'View Profile' : 'View Details'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const WishlistPage = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userTags, setUserTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItemType, setSelectedItemType] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('dateAdded'); // dateAdded, price, title, priority
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    flats: 0,
    flatmates: 0,
    pgs: 0,
    categories: {}
  });

  useEffect(() => {
    loadWishlistData();
    loadCategories();
    loadUserTags();
  }, [selectedCategory, selectedItemType, selectedTags, page, searchQuery, sortBy, sortOrder]);

  const loadWishlistData = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) return;

      const params = new URLSearchParams();
      params.append('userEmail', userEmail);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedItemType !== 'all') params.append('itemType', selectedItemType);
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','));
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', page);
      params.append('limit', 12);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await fetch(`/api/wishlist?${params}`);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setWishlistItems(data.data.items);
          setTotalPages(data.data.totalPages);
          setStats(data.data.stats || stats);
        }
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update item notes/tags
  const updateItemDetails = async (itemId, updates) => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) return;

      const response = await fetch('/api/wishlist/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          itemId,
          userEmail,
          ...updates
        })
      });

      if (response.ok) {
        loadWishlistData();
        setEditingItem(null);
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  // Navigate to item details
  const navigateToItem = (item) => {
    if (item.itemType === 'flat') {
      navigate(`/flats/${item.itemId}`);
    } else if (item.itemType === 'flatmate') {
      navigate(`/flatmate/${item.itemId}`);
    } else if (item.itemType === 'pg') {
      // For now, navigate to pg-rentals page, can be updated when PG details page is available
      navigate(`/pg-rentals?id=${item.itemId}`);
    } else {
      // Fallback to the original logic
      const routes = {
        flat: `/explore-flats`,
        flatmate: `/find-flatmate`,
        pg: `/pg-rentals`
      };
      
      const route = routes[item.itemType];
      if (route) {
        navigate(`${route}?id=${item.itemId}`);
      }
    }
  };

  // Export wishlist
  const exportWishlist = () => {
    const csvContent = wishlistItems.map(item => ({
      'Type': item.itemType,
      'Title': item.itemSnapshot?.title || '',
      'Location': item.itemSnapshot?.location || '',
      'Price': item.itemSnapshot?.price || '',
      'Category': item.category,
      'Tags': item.tags?.join(', ') || '',
      'Notes': item.notes || '',
      'Date Added': new Date(item.createdAt).toLocaleDateString(),
      'Priority': item.priority || 'medium'
    }));

    const csv = [
      Object.keys(csvContent[0]).join(','),
      ...csvContent.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wishlist-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Copy item link
  const copyItemLink = async (item) => {
    const routes = {
      flat: `/explore-flats`,
      flatmate: `/find-flatmate`, 
      pg: `/pg-rentals`
    };
    
    const route = routes[item.itemType];
    if (route) {
      const url = `${window.location.origin}${route}?id=${item.itemId}`;
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
    }
  };

  const loadCategories = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) return;
      
      const response = await fetch(`/api/wishlist/categories?userEmail=${encodeURIComponent(userEmail)}`);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadUserTags = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) return;
      
      const response = await fetch(`/api/wishlist/tags?userEmail=${encodeURIComponent(userEmail)}`);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserTags(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const handleRemoveItem = async (itemId, itemType) => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) return;
      
      const response = await fetch('/api/wishlist/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemId, itemType, userEmail })
      });

      if (response.ok) {
        loadWishlistData();
        loadCategories();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleBulkAction = async (action, targetCategory = null) => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) return;
      
      let endpoint, body;

      if (action === 'remove') {
        endpoint = '/api/wishlist/bulk/remove';
        body = { wishlistItemIds: selectedItems, userEmail };
      } else if (action === 'category') {
        endpoint = '/api/wishlist/bulk/category';
        body = { wishlistItemIds: selectedItems, category: targetCategory, userEmail };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setSelectedItems([]);
        setShowBulkActions(false);
        loadWishlistData();
        loadCategories();
      }
    } catch (error) {
      console.error('Error in bulk action:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header with Stats */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
              <p className="text-gray-600">Organize and manage your saved properties and flatmates</p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <button
                onClick={exportWishlist}
                disabled={wishlistItems.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Heart className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Saved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total || wishlistItems.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Home className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Flats</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.flats || wishlistItems.filter(item => item.itemType === 'flat').length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Flatmates</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.flatmates || wishlistItems.filter(item => item.itemType === 'flatmate').length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Building className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">PGs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pgs || wishlistItems.filter(item => item.itemType === 'pg').length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters and Controls */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>
                        {cat._id.charAt(0).toUpperCase() + cat._id.slice(1)} ({cat.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={selectedItemType}
                    onChange={(e) => setSelectedItemType(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="flat">Flats</option>
                    <option value="flatmate">Flatmates</option>
                    <option value="pg">PGs</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="dateAdded">Date Added</option>
                    <option value="title">Title</option>
                    <option value="price">Price</option>
                    <option value="priority">Priority</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-center"
                  >
                    <ArrowUpDown className="w-4 h-4 mr-1" />
                    {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  </button>
                </div>

                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search saved items..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* View Mode and Actions */}
              <div className="flex items-center gap-3">
                {selectedItems.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{selectedItems.length} selected</span>
                    <button
                      onClick={() => setShowBulkActions(!showBulkActions)}
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Actions
                    </button>
                  </div>
                )}
                
                {/* View Mode */}
                <div className="flex border border-gray-300 rounded-md overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                
                <button
                  onClick={loadWishlistData}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            {showBulkActions && selectedItems.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Bulk Actions:</span>
                  <button
                    onClick={() => handleBulkAction('remove')}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Remove All
                  </button>
                  <div className="border-l border-gray-300 pl-2 ml-2">
                    <span className="text-sm text-gray-600 mr-2">Move to:</span>
                    {['favorites', 'maybe', 'contacted', 'visited', 'applied'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => handleBulkAction('category', cat)}
                        className="px-2 py-1 bg-gray-200 text-gray-700 text-sm rounded mr-1 hover:bg-gray-300"
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved items yet</h3>
            <p className="text-gray-600 mb-6">Start saving flats, flatmates, and PGs to organize your search</p>
            <button 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => navigate('/explore-flats')}
            >
              Browse Properties
            </button>
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {wishlistItems.map(item => (
                <WishlistCard 
                  key={item._id} 
                  item={item}
                  selectedItems={selectedItems}
                  setSelectedItems={setSelectedItems}
                  updateItemDetails={updateItemDetails}
                  navigateToItem={navigateToItem}
                  copyItemLink={copyItemLink}
                  handleRemoveItem={handleRemoveItem}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(pageNum => 
                      pageNum === 1 || 
                      pageNum === totalPages || 
                      Math.abs(pageNum - page) <= 1
                    )
                    .map((pageNum, index, array) => (
                      <React.Fragment key={pageNum}>
                        {index > 0 && array[index - 1] !== pageNum - 1 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <button
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-2 rounded-md text-sm ${
                            pageNum === page
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      </React.Fragment>
                    ))}
                  
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

};
export default WishlistPage;
