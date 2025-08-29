"use client";
import { useState, useEffect } from 'react';
import { X, User, Mail, Save, Crown, Zap, Settings } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userInfo?: {
    id: string;
    username: string;
    displayName: string;
    email?: string;
  } | null;
  onSave?: (updatedInfo: { displayName: string; email: string }) => Promise<void>;
}

export default function SettingsModal({ isOpen, onClose, userInfo, onSave }: SettingsModalProps) {
  const [formData, setFormData] = useState({
    displayName: '',
    email: ''
  });
  const [originalData, setOriginalData] = useState({
    displayName: '',
    email: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [loadingUserInfo, setLoadingUserInfo] = useState(false);

  // Initialize form data when modal opens or userInfo changes
  useEffect(() => {
    if (userInfo) {
      // If we have userInfo, use it to initialize the form
      const initialData = {
        displayName: userInfo.displayName || '',
        email: userInfo.email || ''
      };
      setFormData(initialData);
      setOriginalData(initialData);
    } else if (isOpen) {
      // If modal is opening and we don't have userInfo, fetch it
      fetchUserInfo();
    }
    
    // Fetch subscription data when modal opens
    if (isOpen && (userInfo?.id || !loadingUserInfo)) {
      fetchSubscriptionData();
    }
  }, [userInfo, isOpen]);
  
  // Fetch user info from API
  const fetchUserInfo = async () => {
    setLoadingUserInfo(true);
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profile) {
          const profileData = {
            displayName: data.profile.displayName || data.profile.originalWhopData?.name || data.profile.username || '',
            email: data.profile.email || ''
          };
          setFormData(profileData);
          setOriginalData(profileData);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    } finally {
      setLoadingUserInfo(false);
    }
  };

  // Fetch subscription tier and usage data
  const fetchSubscriptionData = async () => {
    // If we have userInfo, use its ID, otherwise fetch user info first
    let userId = userInfo?.id;
    
    if (!userId) {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.profile) {
            userId = data.profile.id;
          }
        }
      } catch (error) {
        console.error('Failed to fetch user info for subscription data:', error);
        return;
      }
    }
    
    if (!userId) return;
    
    setLoadingSubscription(true);
    try {
      const response = await fetch('/api/subscription?action=usage', {
        headers: {
          'x-whop-user-id': userId
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  // Check if form has changes
  useEffect(() => {
    const hasChanged = 
      formData.displayName !== originalData.displayName ||
      formData.email !== originalData.email;
    setHasChanges(hasChanged);
  }, [formData, originalData]);

  const handleSave = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await onSave(formData);
      setOriginalData(formData);
      setHasChanges(false);
      setSuccessMessage('Settings saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setFormData(originalData);
    setHasChanges(false);
    setError(null);
    setSuccessMessage(null);
    onClose();
  };

  const handleRefresh = async () => {
    await fetchUserInfo();
    if (userInfo?.id) {
      await fetchSubscriptionData();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden' // Added to prevent scrollbars
        }}
        onClick={handleCancel}
      >
        {/* Modal */}
        <div
          className="bg-gray-900 rounded-lg shadow-lg border border-gray-700 w-full max-w-md mx-4"
          style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid rgba(107, 114, 128, 0.3)',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
            width: '100%',
            maxWidth: '36rem',
            margin: '0 1rem',
            position: 'relative',
            zIndex: 201,
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-6 border-b border-gray-800"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.5rem',
              borderBottom: '1px solid rgba(31, 41, 55, 0.5)'
            }}
          >
            <h2 
              className="text-xl font-semibold text-white flex items-center gap-2"
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Settings size={20} />
              Settings
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-white transition-colors"
              style={{
                color: '#9ca3af',
                transition: 'color 0.2s ease'
              }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div 
            className="p-6 space-y-6"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              overflow: 'hidden' // Removed max-height and overflowY to prevent scrollbars
            }}
          >
            {/* User Info Section */}
            <div>
              <h3 
                className="text-lg font-medium text-white mb-4 flex items-center gap-2"
                style={{
                  fontSize: '1.125rem',
                  fontWeight: '500',
                  color: '#ffffff',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <User size={18} />
                User Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label 
                    htmlFor="displayName" 
                    className="block text-sm font-medium text-gray-300 mb-1"
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#d1d5db',
                      marginBottom: '0.25rem'
                    }}
                  >
                    Display Name
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.375rem',
                      color: '#ffffff',
                      outline: 'none'
                    }}
                  />
                  <p 
                    className="text-xs text-gray-500 mt-1"
                    style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      marginTop: '0.25rem'
                    }}
                  >
                    {typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 
                      'Development mode: You can test saving settings here' :
                      'Your display name for personalized AI responses'
                    }
                  </p>
                </div>

                <div>
                  <label 
                    htmlFor="email" 
                    className="block text-sm font-medium text-gray-300 mb-1"
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#d1d5db',
                      marginBottom: '0.25rem'
                    }}
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.375rem',
                      color: '#ffffff',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Subscription Tier Display */}
            {subscriptionData && (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: subscriptionData.usage.tier === 'free' ? '#374151' : subscriptionData.usage.tier === 'premium' ? '#1e3a8a' : '#7c3aed',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div 
                  className="flex items-center gap-2 mb-2"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}
                >
                  {subscriptionData.usage.tier === 'free' ? (
                    <User size={16} style={{ color: '#9ca3af' }} />
                  ) : subscriptionData.usage.tier === 'premium' ? (
                    <Crown size={16} style={{ color: '#fbbf24' }} />
                  ) : (
                    <Zap size={16} style={{ color: '#a855f7' }} />
                  )}
                  <span 
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#ffffff',
                      textTransform: 'capitalize'
                    }}
                  >
                    {subscriptionData.usage.tier} Plan
                  </span>
                </div>
                
                <div style={{ fontSize: '0.75rem', color: '#d1d5db' }}>
                  <div style={{ marginBottom: '0.25rem' }}>
                    Daily Messages: {subscriptionData.utilization.dailyMessages.used} / {subscriptionData.utilization.dailyMessages.limit === -1 ? '∞' : subscriptionData.utilization.dailyMessages.limit}
                  </div>
                  <div style={{ marginBottom: '0.25rem' }}>
                    Sessions: {subscriptionData.usage.sessions?.length || 0} / {subscriptionData.limits.maxSessions === -1 ? '∞' : subscriptionData.limits.maxSessions}
                  </div>
                  <div>
                    Memory Retention: {subscriptionData.limits.memoryRetention} day{subscriptionData.limits.memoryRetention !== 1 ? 's' : ''}
                  </div>
                </div>
                
                {subscriptionData.utilization.dailyMessages.percentage > 80 && subscriptionData.usage.tier === 'free' && (
                  <div 
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      color: '#fbbf24'
                    }}
                  >
                    ⚠️ You're approaching your daily limit. Consider upgrading for more messages.
                  </div>
                )}
              </div>
            )}

            {/* Features based on tier */}
            {subscriptionData && (
              <div>
                <h4 
                  className="text-md font-medium text-white mb-2"
                  style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#ffffff',
                    marginBottom: '0.5rem'
                  }}
                >
                  Plan Features
                </h4>
                <ul 
                  className="space-y-1 text-sm text-gray-300"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    fontSize: '0.875rem',
                    color: '#d1d5db'
                  }}
                >
                  {subscriptionData.utilization.features.map((feature: string, index: number) => (
                    <li 
                      key={index} 
                      className="flex items-center gap-2"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span style={{ color: '#10b981' }}>✓</span>
                      {feature.replace(/_/g, ' ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div 
                className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm"
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(127, 29, 29, 0.5)',
                  border: '1px solid #b91c1c',
                  borderRadius: '0.5rem',
                  color: '#fecaca',
                  fontSize: '0.875rem'
                }}
              >
                {error}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div 
                className="p-3 bg-green-900/50 border border-green-700 rounded-lg text-green-200 text-sm"
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(21, 128, 61, 0.5)',
                  border: '1px solid #16a34a',
                  borderRadius: '0.5rem',
                  color: '#bbf7d0',
                  fontSize: '0.875rem'
                }}
              >
                {successMessage}
              </div>
            )}
          </div>

          {/* Footer */}
          <div 
            className="flex items-center justify-between p-6 border-t border-gray-800"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.5rem',
              borderTop: '1px solid rgba(31, 41, 55, 0.5)'
            }}
          >
            <button
              onClick={handleRefresh}
              disabled={loadingUserInfo || loadingSubscription}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors text-sm"
              style={{
                padding: '0.5rem 1rem',
                color: '#d1d5db',
                fontSize: '0.875rem',
                transition: 'color 0.2s ease'
              }}
            >
              {loadingUserInfo || loadingSubscription ? 'Refreshing...' : 'Refresh'}
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#374151',
                  color: '#ffffff',
                  borderRadius: '0.375rem',
                  transition: 'background-color 0.2s ease'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className={`px-4 py-2 rounded-md transition-colors text-sm flex items-center gap-2 ${
                  hasChanges 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: hasChanges ? '#2563eb' : '#374151',
                  color: hasChanges ? '#ffffff' : '#9ca3af',
                  borderRadius: '0.375rem',
                  transition: 'background-color 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: hasChanges ? 'pointer' : 'not-allowed'
                }}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}