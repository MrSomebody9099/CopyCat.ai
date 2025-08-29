"use client";

import { useState, useEffect } from 'react';
import SubscriptionUpgradeButton from './SubscriptionUpgradeButton';

export default function UserSubscriptionStatus() {
  const [userId, setUserId] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<string>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // First try to get user info
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.profile) {
            setUserId(data.profile.id);
            
            // Then get subscription info
            const subResponse = await fetch(`/api/subscription?action=usage`, {
              headers: {
                'x-whop-user-id': data.profile.id
              }
            });
            
            if (subResponse.ok) {
              const subData = await subResponse.json();
              if (subData.success) {
                setCurrentTier(subData.usage.tier);
              }
            }
          } else {
            // If we can't get user info, still show the button for testing
            setUserId('test-user-id');
          }
        } else {
          // If we can't get user info, still show the button for testing
          setUserId('test-user-id');
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        // Even if we fail to fetch user info, we still want to show the button
        // This is for development/testing purposes
        setUserId('test-user-id');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Always show the button for testing purposes
  return (
    <SubscriptionUpgradeButton 
      userId={userId} 
      currentTier={currentTier} 
    />
  );
}