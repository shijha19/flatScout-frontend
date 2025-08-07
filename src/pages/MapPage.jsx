import React from 'react';
import MapComponent from '../components/MapComponent';

const dummyListings = [
  {
    name: 'PG Delight',
    latitude: 28.6139,
    longitude: 77.2090
  },
  {
    name: 'Hostel Hub',
    latitude: 19.0760,
    longitude: 72.8777
  }
];

const MapPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Find PGs on Map</h1>
      <MapComponent listings={dummyListings} />
    </div>
  );
};

export default MapPage;
