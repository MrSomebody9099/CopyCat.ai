"use client";

import { useEffect, useState } from "react";

export default function TestPage() {
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setLoading(true);
        console.log("🔍 Fetching user profile...");
        
        const response = await fetch('/api/user/profile');
        console.log("📡 Response status:", response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log("📝 User profile data:", data);
          
          if (data.success && data.profile) {
            setUserName(data.profile.displayName || data.profile.username || 'Unknown User');
          } else {
            setError("No user profile found");
          }
        } else {
          console.error("Failed to fetch user profile:", response.status);
          const errorText = await response.text().catch(() => "Unknown error");
          setError(`Error ${response.status}: ${errorText}`);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        setError("Failed to fetch user info");
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-10 bg-gray-900 text-white">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Whop User Test</h1>
        
        {loading ? (
          <div className="flex justify-center">
            <p>Loading user info...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/50 border border-red-700 rounded p-4 mb-4">
            <p className="text-red-300">{error}</p>
            <p className="text-sm text-red-400 mt-2">
              Make sure you are accessing this page through Whop, not directly via Vercel.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl mb-4">
              Hello <span className="font-bold text-blue-400">{userName}</span>!
            </h2>
            <p className="text-gray-300 mb-4">
              Your Whop authentication is working correctly.
            </p>
          </div>
        )}
        
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h3 className="text-xl mb-2">Debugging Information:</h3>
          <ul className="text-sm space-y-1 text-gray-400">
            <li>• Check browser console for detailed logs</li>
            <li>• User authentication works only through Whop</li>
            <li>• Direct Vercel access won't authenticate</li>
            <li>• Use Whop URL: <span className="text-xs bg-gray-700 p-1 rounded">whop.com/joined/[...]</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}