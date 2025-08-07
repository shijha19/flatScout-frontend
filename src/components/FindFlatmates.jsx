import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FlatmateCard from "../components/FlatmateCard";
import { useEffect as useEffect2, useState as useState2 } from "react";
import { fetchUserConnections } from "../utils/connections";

export default function FindFlatmates() {
  const [flatmates, setFlatmates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connections, setConnections] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
	const userId = localStorage.getItem("userId");
	const userEmail = localStorage.getItem("userEmail");
	let url = `/api/flatmates/matches/${userId}`;
	if (userEmail) {
	  url += `?userEmail=${encodeURIComponent(userEmail)}`;
	}
	fetch(url)
	  .then((res) => res.json())
	  .then((data) => {
		if (Array.isArray(data)) {
		  setFlatmates(data);
		} else {
		  setFlatmates([]);
		}
		setLoading(false);
	  })
	  .catch(() => {
		setFlatmates([]);
		setLoading(false);
	  });
	// Fetch connections for the logged-in user
	fetchUserConnections().then(setConnections);
  }, []);

	if (loading)
		return (
			<div className="flex justify-center items-center h-64">Loading...</div>
		);

  return (
	<div className="min-h-screen bg-gradient-to-br from-white to-yellow-50 py-8 px-2">
	  <div className="max-w-6xl mx-auto">
		<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
		  <h1 className="text-3xl md:text-4xl font-extrabold text-pink-700 text-center md:text-left mb-4 md:mb-0 tracking-tight drop-shadow-sm">
			Find Flatmates
		  </h1>
		  <button
			className="px-6 py-2 bg-blue-500 text-white rounded-xl font-semibold shadow hover:bg-blue-600 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300"
			onClick={() => navigate("/edit-flatmate-preferences")}
		  >
			Edit Preferences
		  </button>
		</div>
		<div className="bg-white/80 rounded-2xl shadow-xl p-6 md:p-10">
		  {flatmates.length === 0 ? (
			<div className="flex flex-col items-center justify-center py-16">
			  <img
				src="https://www.svgrepo.com/show/40412/empty-box.svg"
				alt="No matches"
				className="w-32 h-32 mb-4 opacity-60"
			  />
			  <p className="text-xl text-gray-400 mb-2 font-medium">
				No compatible flatmates found.
			  </p>
			  <button
				className="mt-2 px-5 py-2 bg-pink-500 text-white rounded-xl font-semibold shadow hover:bg-pink-600 transition-all duration-150"
				onClick={() => navigate("/edit-flatmate-preferences")}
			  >
				Update Profile
			  </button>
			</div>
		  ) : (
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
			  {flatmates.map((f, i) => {
				const isConnected = connections.includes(f._id);
				return (
				  <div key={i} className="animate-fade-in">
					{f.compatibility !== undefined && (
					  <div className="mb-2 flex justify-center">
						<span className="inline-block px-3 py-1 rounded-full bg-pink-100 text-pink-700 font-bold text-xs shadow">
						  Compatibility: {f.compatibility}%
						</span>
					  </div>
					)}
					<FlatmateCard profile={f} alreadyConnected={isConnected} />
				  </div>
				);
			  })}
			</div>
		  )}
		</div>
	  </div>
	</div>
  );
}
