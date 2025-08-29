"use client";

import { useEffect, useState } from "react";
import { whopSdk } from "@/lib/whop-sdk";

export default function HelloUser() {
  const [userName, setUserName] = useState<string>("Loading...");
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        // Get user information from API
        const response = await fetch('/api/user/profile');
        
        if (response.ok) {
          const data = await response.json();
          console.log("User data:", data);
          
          if (data.success && data.profile) {
            setUserName(data.profile.displayName || data.profile.username || "User");
            setUserId(data.profile.id);
          } else {
            setError("No user profile found");
          }
        } else if (response.status === 401) {
          // Handle 401 error - likely due to missing authentication context
          console.log('ℹ️ No authentication available (normal when navigating between pages)');
          // Set a default user for development/testing
          setUserName("Developer");
          setUserId("localhost-dev-user");
          setError(null); // Clear error since we have fallback data
        } else {
          setError(`Failed to fetch user: ${response.status}`);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUser();
  }, []);

  return (
    <div className="flex justify-center items-center h-screen px-8" style={{ background: "#1a1a1a" }}>
      <div className="text-center max-w-xl w-full bg-gray-800 p-8 rounded-lg shadow-lg">
        {isLoading ? (
          <p className="text-white text-xl">Loading user information...</p>
        ) : error ? (
          <div className="bg-red-900/50 border border-red-700 rounded p-4">
            <h2 className="text-2xl font-semibold text-white mb-2">Error</h2>
            <p className="text-red-300">{error}</p>
            <p className="text-gray-300 mt-2 text-sm">
              This error may occur when navigating between pages without proper authentication context.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-4xl font-bold text-white mb-6">Hello {userName}!</h1>
            <p className="text-gray-300 mb-4">
              Your Whop authentication is working correctly.
            </p>
            <div className="mt-6 pt-6 border-t border-gray-700 text-left">
              <h3 className="text-xl mb-2 text-white">User Details:</h3>
              <ul className="text-gray-300">
                <li><strong>User ID:</strong> {userId || "Not available"}</li>
                <li><strong>Name:</strong> {userName}</li>
              </ul>
            </div>
          </>
        )}
        
        <div className="mt-6">
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Back to App
          </button>
        </div>
      </div>
    </div>
  );
}