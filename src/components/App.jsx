import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MapComponent from '../components/MapComponent';

const dummyListings = [
  { name: "PG Alpha", latitude: 28.6139, longitude: 77.2090 },
  { name: "PG Beta", latitude: 19.0760, longitude: 72.8777 },
];

export default function App() {
  const [username, setUsername] = useState("Guest");
  // State to control showing all cards per section
  const [showAllSaved, setShowAllSaved] = useState(false);
  const [showAllScheduled, setShowAllScheduled] = useState(false);
  const [showAllVisited, setShowAllVisited] = useState(false);

  useEffect(() => {
    // Use the name set during login (assumed stored as 'name' in localStorage)
    const storedName = localStorage.getItem("name");
    if (storedName) setUsername(storedName);
  }, []);

  // State for backend flat listings
  const [flats, setFlats] = useState([]);

  // Fetch all flats from backend on mount
  useEffect(() => {
    fetch('/api/flats')
      .then(res => res.json())
      .then(data => setFlats(data.flats || []));
  }, []);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Filtered flats based on search (fix: handle undefined/null fields and trim all fields)
  const filteredFlats = searchTerm.trim()
    ? flats.filter(flat => {
        const term = searchTerm.toLowerCase();
        // Defensive: check all fields as strings
        const title = (flat.title || "").toString().toLowerCase();
        const location = (flat.location || "").toString().toLowerCase();
        const description = (flat.description || "").toString().toLowerCase();
        return (
          title.includes(term) ||
          location.includes(term) ||
          description.includes(term)
        );
      })
    : flats;


  // State and handlers for create new flat form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    image: "",
    description: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/flats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add flat');
      setFlats([data.flat, ...flats]);
      setForm({ title: "", location: "", price: "", image: "", description: "" });
      setShowForm(false);
    } catch (err) {
      alert(err.message);
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
            <p className="text-lg sm:text-2xl text-gray-700 mb-0 font-sans">Discover verified rental homes with map-based search, scam detection, and roommate matching — all in one place.</p>
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center">
          {/* Map Section */}
          <div className="flex justify-center w-full my-8">
            <div className="bg-white rounded-xl shadow-lg p-4 w-full max-w-3xl border border-gray-200" style={{ zIndex: 1 }}>
              <div className="mb-4 text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-2">🗺️ Interactive Property Map</h3>
                <p className="text-sm text-gray-600">Explore flats, PGs, and hostels near NIT Raipur</p>
              </div>
              <MapComponent searchTerm={searchTerm} />
            </div>
          </div>
          {/* Search Bar moved below the map */}
          <div className="w-full flex justify-center mt-4 mb-12">
            <form
              className="relative w-full max-w-xl"
              onSubmit={e => e.preventDefault()}
            >
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search flats..."
                className="w-full px-6 py-3 rounded-full border border-gray-300 shadow focus:outline-none focus:ring-2 focus:ring-yellow-100 text-lg bg-white text-black placeholder-gray-400 pr-16 transition-all duration-200 font-sans"
                aria-label="Search flats"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-yellow-100 hover:bg-yellow-200 text-black font-semibold px-3 py-2 rounded-full shadow transition-all duration-200 flex items-center text-base font-sans"
                tabIndex={-1}
                aria-label="Search"
              >
                <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z' /></svg>
              </button>
            </form>
          </div>

          {/* Section Navigation Buttons removed */}
          {/* Main Content: All Flats as Cards */}
          <main className="flex-1 p-8 w-full">
            <div className="flex items-center w-full mb-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <h2 className="text-2xl font-bold text-black font-sans mx-6 whitespace-nowrap">All Flats</h2>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
            {/* Create New Flat Card Button - top right, plain black/white */}
            <div className="w-full flex justify-end mb-8">
              <Link
                to="/flat-listings"
                className="flex items-center gap-2 bg-black hover:bg-white hover:text-black text-white font-bold py-3 px-7 rounded-full shadow transition-all duration-200 text-lg font-sans border-2 border-black hover:border-black focus:outline-none focus:ring-2 focus:ring-black"
                style={{ boxShadow: '0 4px 16px 0 rgba(0,0,0,0.10)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                <span>Create New Flat</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12 pt-4 px-2">
              {filteredFlats.length === 0 ? (
                <div className="col-span-full text-gray-400 text-center text-lg">No flats listed yet.</div>
              ) : (
                filteredFlats.map((flat) => (
                  <div key={flat._id || flat.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 hover:-translate-y-1">
                    {/* Image Section */}
                    <div className="relative h-48 bg-gradient-to-r from-gray-100 to-gray-200">
                      {flat.image ? (
                        <img 
                          src={flat.image} 
                          alt={flat.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      {/* Price Badge */}
                      <div className="absolute top-3 right-3 bg-white bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-lg font-bold text-green-600">₹{flat.price}</span>
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="p-5">
                      {/* Title and Location */}
                      <div className="mb-3">
                        <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">{flat.title}</h3>
                        <div className="flex items-center text-gray-600 text-sm">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className="line-clamp-1">{flat.location || 'Location not specified'}</span>
                        </div>
                      </div>

                      {/* Property Details */}
                      <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                        {flat.bedrooms && (
                          <div className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                            </svg>
                            <span>{flat.bedrooms} BHK</span>
                          </div>
                        )}
                        {flat.bathrooms && (
                          <div className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                            <span>{flat.bathrooms} Bath</span>
                          </div>
                        )}
                        {flat.area && (
                          <div className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>{flat.area} sq ft</span>
                          </div>
                        )}
                      </div>

                      {/* Furnished Status */}
                      {flat.furnished && (
                        <div className="mb-3">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
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

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {flat.description || 'No description available'}
                      </p>

                      {/* Contact Info */}
                      {(flat.contactName || flat.contactPhone) && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Contact</div>
                          {flat.contactName && (
                            <div className="text-sm font-medium text-gray-700">{flat.contactName}</div>
                          )}
                          {flat.contactPhone && (
                            <div className="text-sm text-gray-600">{flat.contactPhone}</div>
                          )}
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          {flat.city && <span>{flat.city}</span>}
                          {flat.pincode && <span> - {flat.pincode}</span>}
                        </div>
                        <Link
                          to={`/flats/${flat._id || flat.id}`}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-semibold px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
