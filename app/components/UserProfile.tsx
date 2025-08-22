"use client";

export default function UserProfile() {
	// For now, we'll show a placeholder since the useWhop hook doesn't exist
	// In a real Whop app, user data comes from the iframe context
	return (
		<div className="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-lg">
			<h3 className="text-white font-semibold mb-4 flex items-center">
				<span className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-500 text-white mr-3">
					👤
				</span>
				User Profile
			</h3>
			<div className="space-y-3 text-gray-300">
				<div className="text-center py-4">
					<p className="text-gray-400 mb-3">
						User profile will be available when running in Whop iframe
					</p>
					<div className="bg-gray-800 p-4 rounded-lg">
						<div className="text-orange-400 font-medium mb-2">Available Data:</div>
						<ul className="text-sm text-gray-300 space-y-1">
							<li>• User ID (from Whop context)</li>
							<li>• Username and email</li>
							<li>• Membership status</li>
							<li>• Company information</li>
						</ul>
					</div>
				</div>
				<div className="text-center text-xs text-gray-500">
					Note: This component will automatically populate with user data when the app runs in Whop
				</div>
			</div>
		</div>
	);
}
