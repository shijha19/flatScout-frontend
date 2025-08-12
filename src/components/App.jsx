import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MapComponent from '../components/MapComponent';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import OfflineIndicator from '../components/OfflineIndicator';

const dummyListings = [
  { name: "PG Alpha", latitude: 28.6139, longitude: 77.2090 },
  { name: "PG Beta", latitude: 19.0760, longitude: 72.8777 },
];

export default function App() {
  const [username, setUsername] = useState("Guest");
  const navigate = useNavigate();

  // Check user type for conditional rendering
  const userType = localStorage.getItem('userType');
  const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  const isFlatOwner = isLoggedIn && userType === 'flat_owner';

  useEffect(() => {
    // Use the name set during login (assumed stored as 'name' in localStorage)
    const storedName = localStorage.getItem("name");
    if (storedName) setUsername(storedName);

    // Check if user is logged in but hasn't completed preferences
    const hasCompletedPreferences = localStorage.getItem("hasCompletedPreferences");
    
    if (isLoggedIn && !hasCompletedPreferences) {
      // Redirect to preferences form
      navigate('/edit-flatmate-preferences?from=landing');
    }
  }, [navigate, isLoggedIn]);

  // State for backend flat listings (for stats)
  const [flatsCount, setFlatsCount] = useState(0);

  // Fetch flats count for stats
  useEffect(() => {
    fetch('/api/flats')
      .then(res => res.json())
      .then(data => setFlatsCount(data.flats?.length || 0));
  }, []);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to explore page with search term
      window.location.href = `/explore-flats?search=${encodeURIComponent(searchTerm)}`;
    } else {
      window.location.href = '/explore-flats';
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-white font-sans pt-4">
        {/* Hero Banner */}
        <div className="w-full flex justify-center items-center bg-white py-14 mb-0">
          <div className="max-w-5xl w-full flex flex-col items-center text-center px-4">
            <h1 className="w-full text-5xl sm:text-6xl font-extrabold text-black mb-4 font-sans drop-shadow-lg tracking-tight" style={{letterSpacing: '-0.01em'}}>
              Find Your Flat. Skip the Scam. Share the Space.
            </h1>
            <p className="text-lg sm:text-2xl text-gray-700 mb-8 font-sans">Discover verified rental homes with map-based search, scam detection, and roommate matching — all in one place.</p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link
                to="/explore-flats"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg"
              >
                🏠 Explore {flatsCount}+ Flats
              </Link>
              {/* Only show List Property button for flat owners */}
              {isFlatOwner && (
                <Link
                  to="/flat-listings"
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg"
                >
                  📝 List Your Property
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full flex justify-center mt-4 mb-8">
          <form
            className="relative w-full max-w-2xl"
            onSubmit={handleSearch}
          >
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search flats by location, title, or keywords..."
              className="w-full px-8 py-4 rounded-full border-2 border-gray-200 shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg bg-white text-black placeholder-gray-400 pr-20 transition-all duration-200 font-sans"
              aria-label="Search flats"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center text-base font-sans"
              aria-label="Search"
            >
              <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 mr-2' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0112.15 12.15z' /></svg>
              Search
            </button>
          </form>
        </div>
        
        <div className="flex flex-1 flex-col items-center">
          {/* Map Section */}
          <div className="flex justify-center w-full my-8">
            <div className="bg-white rounded-xl shadow-lg p-4 w-full max-w-4xl border border-gray-200" style={{ zIndex: 1 }}>
              <div className="mb-4 text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">🗺️ Interactive Property Map</h3>
                <p className="text-gray-600">Explore flats, PGs, and hostels with precise locations</p>
              </div>
              <MapComponent searchTerm="" />
            </div>
          </div>

          {/* Features Section */}
          <div className="w-full max-w-6xl px-4 py-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose FlatScout?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Listings</h3>
                <p className="text-gray-600">All properties are verified to ensure authenticity and prevent scams.</p>
              </div>

              {/* Feature 2 */}
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Location Search</h3>
                <p className="text-gray-600">Find properties with interactive maps and location-based recommendations.</p>
              </div>

              {/* Feature 3 */}
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-yellow-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Roommate Matching</h3>
                <p className="text-gray-600">Connect with compatible flatmates based on preferences and lifestyle.</p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="w-full bg-gradient-to-r from-gray-900 to-blue-900 text-white py-16">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">Growing Community</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold mb-2">{flatsCount}+</div>
                  <div className="text-xl opacity-90">Verified Properties</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">500+</div>
                  <div className="text-xl opacity-90">Happy Tenants</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">50+</div>
                  <div className="text-xl opacity-90">Locations Covered</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="w-full py-16 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="max-w-4xl mx-auto text-center px-4">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Find Your Perfect Flat?</h2>
              <p className="text-xl text-gray-600 mb-8">Join thousands of users who have found their ideal homes through FlatScout.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/explore-flats"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg"
                >
                  Start Exploring Now
                </Link>
                {username === "Guest" && (
                  <Link
                    to="/signup"
                    className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg"
                  >
                    Create Free Account
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* PWA Components */}
      <PWAInstallPrompt />
      <OfflineIndicator />
    </>
  );
}
