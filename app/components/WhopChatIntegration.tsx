"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSessionManager } from '@/app/hooks/useSessionManager';

interface WhopChatIntegrationProps {
  userId: string;
}

export default function WhopChatIntegration({ userId }: WhopChatIntegrationProps) {
  const {
    currentSessionId,
    enableWhopIntegration,
    loadSessionFromWhop,
    syncSessionWithWhop,
    isWhopIntegrationAvailable
  } = useSessionManager();
  
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');

  // Check if Whop integration is available
  useEffect(() => {
    const checkAvailability = async () => {
      const available = isWhopIntegrationAvailable();
      setIsAvailable(available);
      setStatus(available ? 'Whop chat integration is available' : 'Whop chat integration is not available');
    };
    
    checkAvailability();
  }, [isWhopIntegrationAvailable]);

  // Enable Whop integration for current session
  const handleEnableIntegration = useCallback(async () => {
    if (!currentSessionId || !userId) return;
    
    setIsLoading(true);
    setStatus('Enabling Whop integration...');
    
    try {
      const success = await enableWhopIntegration(currentSessionId, userId);
      setIsEnabled(success);
      setStatus(success ? 'Whop integration enabled successfully!' : 'Failed to enable Whop integration');
    } catch (error) {
      setStatus('Error enabling Whop integration');
      console.error('Error enabling Whop integration:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, userId, enableWhopIntegration]);

  // Load session from Whop chat
  const handleLoadFromWhop = useCallback(async () => {
    if (!currentSessionId || !userId) return;
    
    setIsLoading(true);
    setStatus('Loading session from Whop...');
    
    try {
      const success = await loadSessionFromWhop(currentSessionId, userId);
      setStatus(success ? 'Session loaded from Whop successfully!' : 'No Whop chat data found for this session');
    } catch (error) {
      setStatus('Error loading session from Whop');
      console.error('Error loading session from Whop:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, userId, loadSessionFromWhop]);

  // Sync session with Whop chat
  const handleSyncWithWhop = useCallback(async () => {
    if (!currentSessionId) return;
    
    setIsLoading(true);
    setStatus('Syncing session with Whop...');
    
    try {
      const success = await syncSessionWithWhop(currentSessionId);
      setStatus(success ? 'Session synced with Whop successfully!' : 'Failed to sync session with Whop');
    } catch (error) {
      setStatus('Error syncing session with Whop');
      console.error('Error syncing session with Whop:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, syncSessionWithWhop]);

  if (!isAvailable) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
        <p className="font-medium">Whop Chat Integration Unavailable</p>
        <p className="text-sm mt-1">The Whop chat integration is not available. Please check your configuration.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-3">Whop Chat Integration</h3>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-300">
            {isEnabled ? 'Integration Enabled' : 'Integration Disabled'}
          </span>
        </div>
        
        <p className="text-sm text-gray-400">{status}</p>
        
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={handleEnableIntegration}
            disabled={isLoading || isEnabled}
            className={`px-3 py-1.5 text-sm rounded ${
              isLoading || isEnabled
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isLoading ? 'Enabling...' : 'Enable Integration'}
          </button>
          
          <button
            onClick={handleLoadFromWhop}
            disabled={isLoading || !isEnabled}
            className={`px-3 py-1.5 text-sm rounded ${
              isLoading || !isEnabled
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {isLoading ? 'Loading...' : 'Load from Whop'}
          </button>
          
          <button
            onClick={handleSyncWithWhop}
            disabled={isLoading || !isEnabled}
            className={`px-3 py-1.5 text-sm rounded ${
              isLoading || !isEnabled
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isLoading ? 'Syncing...' : 'Sync with Whop'}
          </button>
        </div>
      </div>
    </div>
  );
}