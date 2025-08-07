import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function FlatDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flat, setFlat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/flats/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Flat not found");
        return res.json();
      })
      .then(data => {
        setFlat(data.flat || data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (error) return <div className="text-center text-red-500 mt-20">{error} (ID: {id})</div>;
  if (!flat || (!flat._id && !flat.title)) {
    return <div className="text-center text-gray-400 mt-20">Flat not found for ID: {id}</div>;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-white flex flex-col items-center py-12 px-4">
        <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl border-2 border-pink-200 p-10">
          <button onClick={() => navigate(-1)} className="mb-8 text-base text-pink-600 hover:underline font-semibold">&larr; Back to Listings</button>
          <div className="flex flex-col md:flex-row gap-8">
            {flat.image && (
              <img src={flat.image} alt={flat.title} className="w-full md:w-80 h-64 object-cover rounded-2xl shadow mb-4 md:mb-0" />
            )}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h1 className="text-4xl font-extrabold mb-2 text-black font-sans">{flat.title}</h1>
                <div className="text-lg text-gray-700 mb-2 font-sans flex flex-wrap gap-2">
                  <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">{flat.location}</span>
                  <span className="inline-block bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-semibold">{flat.city}, {flat.state} {flat.pincode}</span>
                  <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">{flat.address}</span>
                </div>
                <div className="flex flex-wrap gap-4 mb-4 mt-2">
                  <span className="bg-pink-200 text-pink-800 px-4 py-2 rounded-full font-bold text-lg">₹{flat.price}</span>
                  <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold">{flat.bedrooms} Bed</span>
                  <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold">{flat.bathrooms} Bath</span>
                  <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold">{flat.area} sq ft</span>
                  <span className="bg-fuchsia-100 text-fuchsia-700 px-4 py-2 rounded-full font-semibold">{flat.furnished}</span>
                </div>
                <div className="text-gray-700 mb-6 text-base font-sans whitespace-pre-line">{flat.description}</div>
              </div>
              <div className="mt-6 border-t pt-6 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="text-gray-500 text-xs uppercase font-bold mb-1">Contact</div>
                  <div className="text-lg font-semibold text-black">{flat.contactName}</div>
                  <div className="text-gray-700">{flat.contactPhone}</div>
                  <div className="text-gray-700">{flat.contactEmail}</div>
                </div>
                <a href={`tel:${flat.contactPhone}`} className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-bold shadow transition text-lg text-center md:ml-4">Call Now</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
