'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [experienceId, setExperienceId] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (experienceId.trim()) {
      router.push(`/experiences/${experienceId.trim()}`);
    }
  };

  return (
    <main className="min-h-screen grid place-items-center p-10 bg-gray-900">
      <div className="card text-center max-w-xl bg-gray-800 p-8 rounded-2xl border border-gray-700">
        <h1 className="text-3xl font-semibold mb-6 text-white">CopyCat AI 🐾</h1>
        <p className="text-gray-300 mb-8">
          Enter your experience ID to access the Whop-embedded app.
        </p>
        
        <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
          <div className="flex flex-col space-y-4">
            <input
              type="text"
              value={experienceId}
              onChange={(e) => setExperienceId(e.target.value)}
              placeholder="Enter experience ID"
              className="px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Launch CopyCat AI
            </button>
          </div>
        </form>
        
        <div className="mt-8 text-sm text-gray-400">
          <p>You can also visit <code className="bg-gray-700 px-2 py-1 rounded">/experiences/&lt;experienceId&gt;</code> directly.</p>
        </div>
      </div>
    </main>
  );
}