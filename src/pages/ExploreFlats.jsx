import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import WishlistButton from '../components/WishlistButton';

const ExploreFlats = () => {
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    priceRange: 'all',
    bedrooms: 'all',
    furnished: 'all',
    sortBy: 'newest'
  });
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const location = useLocation();
  
  // Check if user is a flat owner
  const userType = localStorage.getItem('userType');
  const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  const isFlatOwner = isLoggedIn && userType === 'flat_owner';

  // Get search term from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [location.search]);

  // Fetch flats from backend
  useEffect(() => {
    const fetchFlats = async () => {
      try {
        const response = await fetch('/api/flats');
        const data = await response.json();
        setFlats(data.flats || []);
      } catch (error) {
        console.error('Error fetching flats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlats();
  }, []);

  // Filter and sort flats
  const filteredAndSortedFlats = flats
    .filter(flat => {
      const matchesSearch = !searchTerm || 
        flat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flat.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (flat.description && flat.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesPrice = filters.priceRange === 'all' || (() => {
        const price = parseInt(flat.price);
        switch (filters.priceRange) {
          case 'under-10k': return price < 10000;
          case '10k-20k': return price >= 10000 && price <= 20000;
          case '20k-30k': return price >= 20000 && price <= 30000;
          case 'above-30k': return price > 30000;
          default: return true;
        }
      })();

      const matchesBedrooms = filters.bedrooms === 'all' || 
        flat.bedrooms === parseInt(filters.bedrooms);

      const matchesFurnished = filters.furnished === 'all' || 
        flat.furnished === filters.furnished;

      return matchesSearch && matchesPrice && matchesBedrooms && matchesFurnished;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-low': return parseInt(a.price) - parseInt(b.price);
        case 'price-high': return parseInt(b.price) - parseInt(a.price);
        case 'area-large': return parseInt(b.area || 0) - parseInt(a.area || 0);
        case 'area-small': return parseInt(a.area || 0) - parseInt(b.area || 0);
        case 'newest': 
        default: 
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setFilters({
      priceRange: 'all',
      bedrooms: 'all',
      furnished: 'all',
      sortBy: 'newest'
    });
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading amazing flats for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Explore Premium Flats
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Discover your perfect home from {flats.length}+ verified listings
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <input
                type="text"
                placeholder="Search by location, title, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 text-lg text-gray-900 bg-white rounded-full border-0 shadow-lg focus:ring-4 focus:ring-white/30 focus:outline-none"
              />
              <div className="absolute right-2 top-2">
                <button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-3 rounded-full hover:shadow-lg transition-all duration-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Responsive */}
          {/* Filter Button (visible on all screens) */}
          <div className="mb-4">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition-all"
            >
              Show Filters
            </button>
          </div>

          {/* Overlay for drawer on all screens */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-40 bg-black bg-opacity-40" onClick={() => setShowMobileFilters(false)}></div>
          )}
          {/* Sidebar/Drawer for all screens */}
          <div
            className={`fixed z-50 top-0 left-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
              ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'}
              `}
            style={{ maxWidth: '100vw' }}
          >
            <div className="p-6 sticky top-0">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear All
                </button>
                {/* Close button for all screens */}
                <button
                  className="ml-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                  onClick={() => setShowMobileFilters(false)}
                  aria-label="Close Filters"
                >
                  ×
                </button>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Price Range (Monthly)
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Prices</option>
                  <option value="under-10k">Under ₹10,000</option>
                  <option value="10k-20k">₹10,000 - ₹20,000</option>
                  <option value="20k-30k">₹20,000 - ₹30,000</option>
                  <option value="above-30k">Above ₹30,000</option>
                </select>
              </div>

              {/* Bedrooms */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Bedrooms
                </label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Any</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4 BHK</option>
                  <option value="5">5 BHK</option>
                </select>
              </div>

              {/* Furnished Status */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Furnishing
                </label>
                <select
                  value={filters.furnished}
                  onChange={(e) => handleFilterChange('furnished', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Any</option>
                  <option value="Furnished">Fully Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="area-large">Area: Largest First</option>
                  <option value="area-small">Area: Smallest First</option>
                </select>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredAndSortedFlats.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    {filteredAndSortedFlats.length === 1 ? 'Property' : 'Properties'} Found
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* View Toggle & Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Available Properties
                </h2>
                <p className="text-gray-600">
                  {filteredAndSortedFlats.length} of {flats.length} properties
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="flex bg-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'grid' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'list' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {/* Create Listing Button - Only for flat owners */}
                {isFlatOwner && (
                  <Link
                    to="/flat-listings"
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    List Your Property
                  </Link>
                )}
              </div>
            </div>

            {/* Listings Grid/List */}
            {filteredAndSortedFlats.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m11 0v-5a2 2 0 00-2-2h-2m-4 0H5m0 0v5a2 2 0 002 2h4m-6 0V9a2 2 0 012-2h2m2 5h2m4 0h2"/>
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search terms.</p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "space-y-6"
              }>
                {filteredAndSortedFlats.map((flat) => (
                  <div 
                    key={flat._id} 
                    className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    {/* Image Section */}
                    <div className={`relative ${viewMode === 'list' ? 'w-80 flex-shrink-0' : 'h-64'} bg-gradient-to-br from-gray-100 to-gray-200`}>
                      {flat.image ? (
                        <img 
                          src={flat.image} 
                          alt={flat.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Wishlist Button */}
                      <div className="absolute top-4 left-4 z-20" onClick={(e) => e.stopPropagation()}>
                        <WishlistButton
                          itemType="flat"
                          itemId={flat._id}
                          size="md"
                          showText={false}
                        />
                      </div>

                      {/* Price Badge */}
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg">
                          <span className="text-lg font-bold text-green-600">₹{flat.price}</span>
                          <span className="text-sm text-gray-600">/month</span>
                        </div>
                      </div>

                      {/* Furnished Badge */}
                      {flat.furnished && (
                        <div className="absolute bottom-4 left-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            flat.furnished === 'Furnished' 
                              ? 'bg-green-100 text-green-800' 
                              : flat.furnished === 'Semi-Furnished'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {flat.furnished}
                          </span>
                        </div>
                      )}

                      {/* Wishlist Button */}
                      <div className="absolute top-4 right-4 z-20" onClick={(e) => e.stopPropagation()}>
                        <WishlistButton
                          itemType="flat"
                          itemId={flat._id}
                          size="md"
                          showText={false}
                        />
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex-1">
                      {/* Title and Location */}
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {flat.title}
                        </h3>
                        <div className="flex items-center text-gray-600 text-sm">
                          <svg className="w-4 h-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className="line-clamp-1">{flat.location}</span>
                          {flat.city && <span className="ml-2 text-gray-500">• {flat.city}</span>}
                        </div>
                      </div>

                      {/* Property Features */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {flat.bedrooms && (
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">{flat.bedrooms}</div>
                            <div className="text-xs text-gray-600">Bedrooms</div>
                          </div>
                        )}
                        {flat.bathrooms && (
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-lg font-bold text-purple-600">{flat.bathrooms}</div>
                            <div className="text-xs text-gray-600">Bathrooms</div>
                          </div>
                        )}
                        {flat.area && (
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <div className="text-lg font-bold text-orange-600">{flat.area}</div>
                            <div className="text-xs text-gray-600">sq ft</div>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {flat.description || 'Beautiful property with modern amenities and excellent connectivity.'}
                      </p>

                      {/* Reviews and Rating Section */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {flat.averageRating > 0 ? (
                            <>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <span 
                                    key={i} 
                                    className={`text-lg ${
                                      i < Math.floor(flat.averageRating) 
                                        ? 'text-yellow-400' 
                                        : i === Math.floor(flat.averageRating) && flat.averageRating % 1 >= 0.5
                                        ? 'text-yellow-300'
                                        : 'text-gray-300'
                                    }`}
                                  >
                                    ⭐
                                  </span>
                                ))}
                              </div>
                              <span className="text-sm font-semibold text-gray-700 ml-1">
                                {flat.averageRating}/5
                              </span>
                              <span className="text-xl text-gray-400 mx-1">·</span>
                              <span className="text-sm text-gray-600">
                                {flat.totalReviews || 0} review{(flat.totalReviews || 0) !== 1 ? 's' : ''}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500 italic">No ratings yet</span>
                          )}
                        </div>
                        
                        {/* Latest Review Preview */}
                        {flat.reviews && flat.reviews.length > 0 && (
                          <div className="border-t border-yellow-200 pt-2">
                            <div className="text-xs text-gray-600 mb-1">
                              Latest Review by {flat.reviews[0].reviewerName}
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              "{flat.reviews[0].comment}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Contact Info */}
                      {flat.contactName && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <div className="text-xs text-gray-500 mb-1">Contact Person</div>
                          <div className="font-semibold text-gray-900">{flat.contactName}</div>
                          {flat.contactPhone && (
                            <div className="text-sm text-gray-600">{flat.contactPhone}</div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Link
                          to={`/flats/${flat._id}`}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-center py-3 px-4 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                        >
                          View Details
                        </Link>
                        {flat.contactPhone && (
                          <a
                            href={`tel:${flat.contactPhone}`}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreFlats;
