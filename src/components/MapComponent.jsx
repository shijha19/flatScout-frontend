import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different property types
const createCustomIcon = (color, type) => {
  const iconHtml = `
    <div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
    ">${type}</div>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

const flatIcon = createCustomIcon('#3B82F6', 'F'); // Blue for Flats
const pgIcon = createCustomIcon('#10B981', 'PG'); // Green for PG
const hostelIcon = createCustomIcon('#F59E0B', 'H'); // Orange for Hostels
const collegeIcon = createCustomIcon('#8B5CF6', 'C'); // Purple for Colleges

// Enhanced property data with realistic information
const propertyData = [
  // Colleges/Universities
  {
    id: 'nit-raipur',
    name: 'NIT Raipur',
    type: 'college',
    position: [21.2497, 81.6051],
    description: 'National Institute of Technology Raipur',
    established: '1956',
    website: 'https://www.nitrr.ac.in/'
  },
  
  // Flats
  {
    id: 'flat-1',
    name: 'Sunrise Apartments',
    type: 'flat',
    position: [21.2520, 81.6080],
    price: '₹12,000/month',
    bedrooms: '2 BHK',
    area: '850 sq ft',
    amenities: ['Parking', 'Security', 'Gym'],
    contact: '+91 98765 43210',
    description: 'Modern 2BHK apartment with all amenities near NIT Raipur',
    rating: 4.2,
    furnished: 'Semi-Furnished'
  },
  {
    id: 'flat-2',
    name: 'Green Valley Residency',
    type: 'flat',
    position: [21.2480, 81.6100],
    price: '₹15,000/month',
    bedrooms: '3 BHK',
    area: '1200 sq ft',
    amenities: ['Parking', 'Security', 'Swimming Pool', 'Garden'],
    contact: '+91 98765 43211',
    description: 'Spacious 3BHK flat with garden view',
    rating: 4.5,
    furnished: 'Fully Furnished'
  },
  {
    id: 'flat-3',
    name: 'City Center Flats',
    type: 'flat',
    position: [21.2450, 81.6030],
    price: '₹8,000/month',
    bedrooms: '1 BHK',
    area: '500 sq ft',
    amenities: ['Parking', 'Security'],
    contact: '+91 98765 43212',
    description: 'Affordable 1BHK apartment for students',
    rating: 3.8,
    furnished: 'Unfurnished'
  },
  
  // PG Accommodations
  {
    id: 'pg-1',
    name: 'Students Paradise PG',
    type: 'pg',
    position: [21.2505, 81.6070],
    price: '₹6,500/month',
    roomType: 'Single AC',
    amenities: ['WiFi', 'Food', 'Laundry', 'Study Room'],
    contact: '+91 98765 43213',
    description: 'Premium PG for students with all facilities',
    rating: 4.3,
    gender: 'Boys & Girls',
    meals: '3 meals included'
  },
  {
    id: 'pg-2',
    name: 'Comfort Zone PG',
    type: 'pg',
    position: [21.2490, 81.6045],
    price: '₹5,000/month',
    roomType: 'Double Sharing',
    amenities: ['WiFi', 'Food', 'Security', 'Common Area'],
    contact: '+91 98765 43214',
    description: 'Budget-friendly PG with good food',
    rating: 4.0,
    gender: 'Boys Only',
    meals: '2 meals included'
  },
  {
    id: 'pg-3',
    name: 'Elite Girls PG',
    type: 'pg',
    position: [21.2510, 81.6090],
    price: '₹7,000/month',
    roomType: 'Single AC',
    amenities: ['WiFi', 'Food', 'Security', 'Recreation Room'],
    contact: '+91 98765 43215',
    description: 'Safe and secure PG for girls',
    rating: 4.6,
    gender: 'Girls Only',
    meals: '3 meals included'
  },
  
  // Hostels
  {
    id: 'hostel-1',
    name: 'Budget Stay Hostel',
    type: 'hostel',
    position: [21.2485, 81.6055],
    price: '₹3,500/month',
    roomType: 'Dormitory',
    amenities: ['WiFi', 'Common Kitchen', 'Lounge'],
    contact: '+91 98765 43216',
    description: 'Affordable hostel for short-term stays',
    rating: 3.5,
    capacity: '6-8 beds per room'
  },
  {
    id: 'hostel-2',
    name: 'Backpacker Hub',
    type: 'hostel',
    position: [21.2460, 81.6020],
    price: '₹4,000/month',
    roomType: 'Mixed Dorm',
    amenities: ['WiFi', 'Cafe', 'Common Area', 'Lockers'],
    contact: '+91 98765 43217',
    description: 'Modern hostel with cafe and workspace',
    rating: 4.1,
    capacity: '4-6 beds per room'
  }
];

// Map controls component
const MapControls = ({ onFilterChange, activeFilters, filteredCount, totalCount, searchTerm }) => {
  const map = useMap();
  const [isOpen, setIsOpen] = useState(false);
  
  const filterTypes = [
    { key: 'all', label: 'All', color: '#6B7280', count: propertyData.length },
    { key: 'flat', label: 'Flats', color: '#3B82F6', count: propertyData.filter(p => p.type === 'flat').length },
    { key: 'pg', label: 'PG', color: '#10B981', count: propertyData.filter(p => p.type === 'pg').length },
    { key: 'hostel', label: 'Hostels', color: '#F59E0B', count: propertyData.filter(p => p.type === 'hostel').length },
    { key: 'college', label: 'Colleges', color: '#8B5CF6', count: propertyData.filter(p => p.type === 'college').length }
  ];

  return (
    <div className="absolute top-4 left-4 z-[1000]">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white rounded-lg shadow-lg p-3 mb-2 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
        title="Toggle Property Filters"
      >
        <div className="flex items-center gap-2">
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-sm font-medium text-gray-700">Filters</span>
          {filteredCount < totalCount && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {filteredCount}
            </span>
          )}
        </div>
      </button>

      {/* Collapsible Filter Panel */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-lg p-3 max-w-xs animate-in slide-in-from-left duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-700">Property Types</h3>
            {searchTerm && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {filteredCount} found
              </span>
            )}
          </div>
          
          {searchTerm && (
            <div className="mb-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
              🔍 Searching: "{searchTerm}"
            </div>
          )}
          
          <div className="space-y-1">
            {filterTypes.map(filter => (
              <button
                key={filter.key}
                onClick={() => onFilterChange(filter.key)}
                className={`flex items-center w-full text-left px-3 py-2 rounded text-sm transition-all ${
                  activeFilters.includes(filter.key) 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: filter.color }}
                ></div>
                <span className="flex-1">{filter.label}</span>
                <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded-full ml-2">
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => map.setView([21.2497, 81.6051], 13)}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 transition-colors mb-2"
            >
              📍 Center on NIT
            </button>
            <div className="text-xs text-gray-500 text-center">
              Showing {filteredCount} of {totalCount} properties
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MapComponent = ({ searchTerm = '' }) => {
  const [activeFilters, setActiveFilters] = useState(['all']);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        // Toggle filters - this will be handled by the MapControls component
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleFilterChange = (filterType) => {
    if (filterType === 'all') {
      setActiveFilters(['all']);
    } else {
      setActiveFilters(prev => {
        const newFilters = prev.filter(f => f !== 'all');
        if (newFilters.includes(filterType)) {
          const filtered = newFilters.filter(f => f !== filterType);
          return filtered.length === 0 ? ['all'] : filtered;
        } else {
          return [...newFilters, filterType];
        }
      });
    }
  };

  const getFilteredProperties = () => {
    let filtered = activeFilters.includes('all') ? propertyData : propertyData.filter(property => activeFilters.includes(property.type));
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(property => 
        property.name.toLowerCase().includes(term) ||
        property.description.toLowerCase().includes(term) ||
        property.type.toLowerCase().includes(term) ||
        (property.price && property.price.toLowerCase().includes(term)) ||
        (property.amenities && property.amenities.some(amenity => amenity.toLowerCase().includes(term)))
      );
    }
    
    return filtered;
  };

  const getPropertyIcon = (property) => {
    switch (property.type) {
      case 'flat': return flatIcon;
      case 'pg': return pgIcon;
      case 'hostel': return hostelIcon;
      case 'college': return collegeIcon;
      default: return flatIcon;
    }
  };

  const renderPropertyPopup = (property) => (
    <div className="max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-lg text-gray-900">{property.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          property.type === 'flat' ? 'bg-blue-100 text-blue-800' :
          property.type === 'pg' ? 'bg-green-100 text-green-800' :
          property.type === 'hostel' ? 'bg-orange-100 text-orange-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {property.type.toUpperCase()}
        </span>
      </div>
      
      {property.rating && (
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-sm ${i < Math.floor(property.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                ⭐
              </span>
            ))}
            <span className="ml-1 text-sm text-gray-600">{property.rating}</span>
          </div>
        </div>
      )}

      <p className="text-gray-600 text-sm mb-3">{property.description}</p>

      {property.price && (
        <div className="mb-2">
          <span className="font-semibold text-green-600 text-lg">{property.price}</span>
          {property.bedrooms && <span className="text-gray-500 ml-2">• {property.bedrooms}</span>}
          {property.area && <span className="text-gray-500 ml-1">• {property.area}</span>}
        </div>
      )}

      {property.roomType && (
        <div className="mb-2">
          <span className="text-gray-700 font-medium">Room: </span>
          <span className="text-gray-600">{property.roomType}</span>
          {property.gender && <span className="text-gray-500 ml-2">• {property.gender}</span>}
        </div>
      )}

      {property.amenities && (
        <div className="mb-3">
          <span className="text-gray-700 font-medium text-sm">Amenities: </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {property.amenities.slice(0, 4).map((amenity, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                {amenity}
              </span>
            ))}
            {property.amenities.length > 4 && (
              <span className="text-gray-500 text-xs">+{property.amenities.length - 4} more</span>
            )}
          </div>
        </div>
      )}

      {property.contact && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <a 
            href={`tel:${property.contact}`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            📞 Call
          </a>
          <a 
            href={`https://wa.me/${property.contact.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            💬 WhatsApp
          </a>
          <button
            onClick={() => setSelectedProperty(property)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            📋 Details
          </button>
        </div>
      )}

      {property.website && (
        <div className="mt-2">
          <a 
            href={property.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            🌐 Visit Website
          </a>
        </div>
      )}
    </div>
  );

  const filteredProperties = getFilteredProperties();

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <MapContainer 
        center={[21.2497, 81.6051]} 
        zoom={13} 
        style={{ width: '100%', height: '500px', zIndex: 1 }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />
        
        <MapControls 
          onFilterChange={handleFilterChange} 
          activeFilters={activeFilters}
          filteredCount={filteredProperties.length}
          totalCount={propertyData.length}
          searchTerm={searchTerm}
        />
        
        {filteredProperties.map((property) => (
          <Marker
            key={property.id}
            position={property.position}
            icon={getPropertyIcon(property)}
          >
            <Popup maxWidth={300} className="custom-popup">
              {renderPropertyPopup(property)}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Quick Legend at bottom right */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg p-2">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Flats</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>PG</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Hostels</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Colleges</span>
          </div>
        </div>
      </div>

      {/* Property Details Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedProperty.name}</h2>
              <button
                onClick={() => setSelectedProperty(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              {selectedProperty.price && (
                <div className="flex justify-between">
                  <span className="font-medium">Price:</span>
                  <span className="text-green-600 font-bold">{selectedProperty.price}</span>
                </div>
              )}
              
              {selectedProperty.bedrooms && (
                <div className="flex justify-between">
                  <span className="font-medium">Type:</span>
                  <span>{selectedProperty.bedrooms}</span>
                </div>
              )}
              
              {selectedProperty.area && (
                <div className="flex justify-between">
                  <span className="font-medium">Area:</span>
                  <span>{selectedProperty.area}</span>
                </div>
              )}
              
              {selectedProperty.furnished && (
                <div className="flex justify-between">
                  <span className="font-medium">Furnished:</span>
                  <span>{selectedProperty.furnished}</span>
                </div>
              )}
              
              {selectedProperty.meals && (
                <div className="flex justify-between">
                  <span className="font-medium">Meals:</span>
                  <span>{selectedProperty.meals}</span>
                </div>
              )}
              
              {selectedProperty.amenities && (
                <div>
                  <span className="font-medium">All Amenities:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedProperty.amenities.map((amenity, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <p className="text-gray-600 mb-3">{selectedProperty.description}</p>
                {selectedProperty.contact && (
                  <div className="flex gap-2">
                    <a 
                      href={`tel:${selectedProperty.contact}`}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-center transition-colors"
                    >
                      📞 Call Now
                    </a>
                    <a 
                      href={`https://wa.me/${selectedProperty.contact.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-center transition-colors"
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
