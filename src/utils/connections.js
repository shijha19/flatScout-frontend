// Utility to get the user's connections from the backend
export async function fetchUserConnections() {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) return [];
  try {
    const res = await fetch(`/api/user/connections?email=${encodeURIComponent(userEmail)}`);
    const data = await res.json();
    if (Array.isArray(data.connections)) {
      return data.connections.map(conn => conn._id);
    }
    return [];
  } catch {
    return [];
  }
}
