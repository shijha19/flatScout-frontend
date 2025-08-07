import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const email = localStorage.getItem("userEmail");
      const res = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, oldPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to change password.");
      } else {
        setSuccess("Password changed successfully!");
        setTimeout(() => navigate("/profile"), 1200);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg border border-pink-100">
      <h2 className="text-2xl font-bold text-pink-700 mb-6">Change Password</h2>
      {error && <div className="mb-4 text-red-600 bg-red-50 px-4 py-2 rounded">{error}</div>}
      {success && <div className="mb-4 text-green-700 bg-green-50 px-4 py-2 rounded">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Old Password</label>
          <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-200" required />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">New Password</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-200" required />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Confirm New Password</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-200" required />
        </div>
        <div className="flex gap-4 mt-6">
          <button type="submit" disabled={loading} className="px-6 py-2 bg-pink-500 text-white rounded-lg font-semibold shadow hover:bg-pink-600 transition disabled:opacity-60">{loading ? "Saving..." : "Change Password"}</button>
          <a href="/profile" className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-200 transition text-center">Cancel</a>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
