import { headers } from "next/headers";
import { whopSdk } from "@/lib/whop-sdk";

export default async function TestServerPage() {
  // Get the header list
  const headersList = headers();
  
  // Log all headers for debugging - using get method for each header
  const headerObj: Record<string, string | null> = {};
  // Common headers to check
  const headerNames = ['host', 'referer', 'x-whop-user-id', 'user-agent'];
  headerNames.forEach(name => {
    headerObj[name] = headersList.get(name) || null;
  });
  console.log("Server Headers:", headerObj);
  
  let userName = "Unknown";
  let error = null;
  let userId = null;
  
  try {
    // Get user ID from headers (similar to verifyUserToken in the example)
    userId = headersList.get("x-whop-user-id");
    console.log("x-whop-user-id header:", userId);
    
    if (userId) {
      // Get user information from Whop SDK
      const userProfile = await whopSdk.users.getUser({ userId });
      userName = userProfile.name || userProfile.username;
      console.log("Whop user profile:", userProfile);
    } else {
      error = "No user ID found in headers";
      console.error(error);
    }
  } catch (err) {
    console.error("Error fetching Whop user:", err);
    error = `Error: ${err instanceof Error ? err.message : String(err)}`;
  }

  // Current host for debugging
  const host = headersList.get("host") || "unknown";
  const referer = headersList.get("referer") || "none";
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-10 bg-gray-900 text-white">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Whop Server Test</h1>
        
        {error ? (
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
            <li>• Host: <span className="text-xs bg-gray-700 p-1 rounded">{host}</span></li>
            <li>• Referer: <span className="text-xs bg-gray-700 p-1 rounded">{referer}</span></li>
            <li>• User ID: <span className="text-xs bg-gray-700 p-1 rounded">{userId || "Not found"}</span></li>
            <li>• Server rendered at: <span className="text-xs bg-gray-700 p-1 rounded">{new Date().toISOString()}</span></li>
          </ul>
        </div>
      </div>
    </div>
  );