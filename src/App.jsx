import { useEffect, useState } from "react";

export default function App() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetch("/health") // Use relative URL for proxy
      .then((res) => res.json())
      .then((data) => setHealth(data.status))
      .catch(() => setHealth("error"));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center mt-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to the Frontend!
          </h1>
          <p className="text-gray-600 mb-4">
            This is a React app styled with Tailwind CSS v3.
          </p>
          <div className="mt-4">
            <span className="font-mono text-sm">Backend health: </span>
            {health === null && (
              <span className="text-yellow-500">Checking...</span>
            )}
            {health === "ok" && <span className="text-green-600">OK</span>}
            {health === "error" && <span className="text-red-600">Error</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
