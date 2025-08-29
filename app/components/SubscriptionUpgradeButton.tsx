"use client";

import { useState, useEffect } from 'react';

interface SubscriptionUpgradeButtonProps {
  userId?: string;
  currentTier?: string;
}

export default function SubscriptionUpgradeButton({ 
  userId, 
  currentTier = 'free' 
}: SubscriptionUpgradeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [isWhopAvailable, setIsWhopAvailable] = useState(false);

  // Get tier details based on the user's requirements
  const getTierDetails = (tier: string) => {
    switch (tier) {
      case 'free':
        return {
          name: 'Free Tier',
          chatsPerConversation: 5,
          conversations: 3,
          totalChats: 15,
          price: 'Free',
          features: ['Basic chat functionality', 'Limited conversations', '1 day memory']
        };
      case 'premium':
        return {
          name: 'Paid Tier',
          chatsPerConversation: 10,
          conversations: 5,
          totalChats: 50,
          price: '$9/week',
          features: ['Enhanced chat limits', 'More conversations', '30 days memory', 'Priority support']
        };
      default:
        return {
          name: 'Agency/Business',
          chatsPerConversation: 'Unlimited',
          conversations: 'Unlimited',
          totalChats: 'Unlimited',
          price: 'Coming Soon',
          features: ['All premium features', 'Custom solutions', 'Dedicated support', '1 year memory']
        };
    }
  };

  // Check if we're in a Whop environment
  useEffect(() => {
    // More robust check for Whop environment
    const isRunningInWhop = typeof window !== 'undefined' && 
      (window.location.hostname.includes('whop.com') || 
       window.location.search.includes('whop') ||
       // Check for Whop-specific context
       !!(window as any).WHOP_IFRAME_CONTEXT ||
       // Check if we're in an iframe and the parent is Whop
       (window.self !== window.top && document.referrer.includes('whop.com')));
    
    setIsWhopAvailable(isRunningInWhop);
    
    // Always log for debugging
    console.log('Whop environment check:', {
      hostname: window.location.hostname,
      search: window.location.search,
      isWhop: isRunningInWhop,
      referrer: document.referrer
    });
  }, []);

  const handleUpgradeClick = async () => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    // If not in Whop environment, just simulate the upgrade
    if (!isWhopAvailable) {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call delay
      setTimeout(() => {
        setIsLoading(false);
        setIsOpen(false);
        alert('Upgrade simulation complete! In a real Whop environment, this would open the payment modal.');
      }, 1000);
      
      return;
    }

    // Only try to use Whop SDK if we're in a Whop environment
    try {
      setIsLoading(true);
      setError(null);
      
      // Dynamically import the Whop SDK only when needed
      const { useIframeSdk } = await import('@whop/react');
      const iframeSdk = useIframeSdk();
      
      // Use Whop's in-app purchase flow
      const res = await iframeSdk.inAppPurchase({ 
        planId: process.env.NEXT_PUBLIC_PREMIUM_PLAN_ID || "plan_uGs96XPxv08dR" 
      });
      
      if (res.status === "ok") {
        setReceiptId(res.data.receiptId);
        // Refresh the page to show updated tier
        window.location.reload();
      } else {
        setError(res.error || 'Upgrade failed');
      }
    } catch (err: any) {
      console.error('Upgrade error:', err);
      setError('Unable to process upgrade. This feature works in Whop environment.');
      
      // For testing purposes, we can still simulate success
      setTimeout(() => {
        setIsLoading(false);
        setIsOpen(false);
        alert('Upgrade simulation complete! In a real Whop environment, this would process the payment.');
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  // Always show the button for testing purposes
  return (
    <div className="relative">
      {/* Upgrade Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
        style={{
          background: 'white', // White background
          border: '2px solid transparent', // Fine border
          borderRadius: '9999px',
          padding: '0.5rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          backgroundImage: 'linear-gradient(white, white), linear-gradient(45deg, #8B5CF6, #3B82F6, #10B981, #F59E0B, #EF4444, #8B5CF6)',
          backgroundClip: 'padding-box, border-box',
          backgroundOrigin: 'padding-box, border-box',
          position: 'relative',
          zIndex: 60 // Increased from 50 to ensure it's above sidebar (which has z-index 50)
        }}
      >
        <span className="font-medium text-sm text-black">Upgrade Plan</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 100, // Increased from 1000 to ensure it's above sidebar (which has z-index 50)
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem'
          }}
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-xs"
            style={{
              backgroundColor: '#1a1a1a', // Match default background
              border: '1px solid #374151',
              borderRadius: '0.75rem',
              width: '100%',
              maxWidth: '32rem', // Increased from 20rem to 32rem for more width
              fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', // Match default font
              zIndex: 101, // Increased from 1001 to ensure it's above overlay
              overflow: 'hidden' // Added to prevent scrollbars
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-800">
              <h3 
                className="text-lg font-bold text-white text-right"
              >
                Upgrade Your Plan
              </h3>
              <p 
                className="text-gray-400 mt-1 text-right text-sm"
              >
                Get more features and higher limits
              </p>
            </div>

            {/* Tier Options */}
            <div className="p-4 space-y-3 pl-8"> {/* Added more left padding (pl-8) to shift content right */}
              {/* Display tiers in a horizontal layout for wider screens */}
              <div className="flex flex-col md:flex-row md:space-x-4 space-y-3 md:space-y-0">
                {/* Free Tier */}
                <div className="p-3 rounded-lg border border-gray-700 bg-gray-800 flex-1">
                  <div className="flex justify-end items-start">
                    <div className="text-right">
                      <h4 className="font-semibold text-white text-sm">{getTierDetails('free').name}</h4>
                      <p className="text-lg font-bold text-white mt-1">{getTierDetails('free').price}</p>
                    </div>
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-gray-300 text-right">
                    <li>{getTierDetails('free').chatsPerConversation} chats per conversation</li>
                    <li>{getTierDetails('free').conversations} conversations</li>
                    <li>Total: {getTierDetails('free').totalChats} chats per day</li>
                  </ul>
                </div>

                {/* Premium Tier */}
                <div className="p-3 rounded-lg border-2 border-purple-500 bg-gradient-to-br from-gray-800 to-gray-900 flex-1">
                  <div className="flex justify-end items-start">
                    <div className="text-right">
                      <h4 className="font-semibold text-white text-sm">{getTierDetails('premium').name}</h4>
                      <p className="text-lg font-bold text-white mt-1">{getTierDetails('premium').price}</p>
                    </div>
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-gray-300 text-right">
                    <li>{getTierDetails('premium').chatsPerConversation} chats per conversation</li>
                    <li>{getTierDetails('premium').conversations} conversations</li>
                    <li>Total: {getTierDetails('premium').totalChats} chats per day</li>
                  </ul>
                  <button
                    onClick={handleUpgradeClick}
                    disabled={isLoading || currentTier === 'premium'}
                    className={`w-full mt-3 py-1.5 rounded-lg font-medium transition-colors ${
                      currentTier === 'premium' 
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                        : 'bg-white hover:bg-gray-100 text-black'
                    }`}
                    style={{
                      backgroundColor: 'white',
                      color: 'black',
                      padding: '0.375rem',
                      borderRadius: '0.5rem',
                      fontWeight: '500',
                      transition: 'background-color 0.2s ease',
                      cursor: currentTier === 'premium' ? 'not-allowed' : 'pointer',
                      border: '1px solid #374151'
                    }}
                  >
                    {isLoading ? 'Processing...' : currentTier === 'premium' ? 'Current Plan' : 'Upgrade'}
                  </button>
                </div>

                {/* Agency/Business Tier */}
                <div className="p-3 rounded-lg border border-gray-700 bg-gray-800 opacity-70 flex-1">
                  <div className="flex justify-end items-start">
                    <div className="text-right">
                      <h4 className="font-semibold text-white text-sm">{getTierDetails('business').name}</h4>
                      <p className="text-lg font-bold text-white mt-1">{getTierDetails('business').price}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 flex justify-end pr-8"> {/* Added more right padding (pr-8) */}
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 text-gray-300 hover:text-white transition-colors text-sm"
                style={{
                  padding: '0.375rem 0.75rem',
                  color: '#D1D5DB',
                  transition: 'color 0.2s ease'
                }}
              >
                Close
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="px-8 pb-3"> {/* Increased left padding from px-4 to px-8 */}
                <div className="p-2 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-xs text-right">
                  {error}
                </div>
              </div>
            )}

            {/* Info Message for Testing */}
            {!isWhopAvailable && (
              <div className="px-8 pb-3"> {/* Increased left padding from px-4 to px-8 */}
                <div className="p-2 bg-blue-900/50 border border-blue-700 rounded-lg text-blue-200 text-xs text-right">
                  Note: Whop SDK not available in this environment. Button will simulate upgrade process.
                </div>
              </div>
            )}

            {/* Success Message */}
            {receiptId && (
              <div className="px-8 pb-3"> {/* Increased left padding from px-4 to px-8 */}
                <div className="p-2 bg-green-900/50 border border-green-700 rounded-lg text-green-200 text-xs text-right">
                  Upgrade successful! Receipt ID: {receiptId}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}