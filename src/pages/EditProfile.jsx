import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    location: ""
  });
  // Fetch user data on mount
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      setError("No user email found. Please log in again.");
      return;
    }
    fetch(`/api/user/profile?email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setForm({
            name: data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            bio: data.user.bio || "",
            location: data.user.location || ""
          });
        } else {
          setError(data.message || "User not found.");
        }
      })
      .catch(() => setError("Failed to load profile. Please try again."));
  }, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to update profile.");
      } else {
        setSuccess("Profile updated successfully!");
        setTimeout(() => navigate("/profile"), 1200);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg border border-pink-100">
      <h2 className="text-2xl font-bold text-pink-700 mb-6">Edit Profile</h2>
      {error && <div className="mb-4 text-red-600 bg-red-50 px-4 py-2 rounded">{error}</div>}
      {success && <div className="mb-4 text-green-700 bg-green-50 px-4 py-2 rounded">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-200" required />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-200" required type="email" />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-200" />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Location</label>
          <input name="location" value={form.location} onChange={handleChange} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-200" />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-200" rows={3} />
        </div>
        <div className="flex gap-4 mt-6">
          <button type="submit" disabled={loading} className="px-6 py-2 bg-pink-500 text-white rounded-lg font-semibold shadow hover:bg-pink-600 transition disabled:opacity-60">{loading ? "Saving..." : "Save Changes"}</button>
          <a href="/profile" className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-200 transition text-center">Cancel</a>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
