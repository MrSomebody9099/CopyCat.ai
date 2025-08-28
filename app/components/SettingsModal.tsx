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

  // Initialize form data when modal opens or userInfo changes
  useEffect(() => {
    if (userInfo) {
      const initialData = {
        displayName: userInfo.displayName || '',
        email: userInfo.email || ''
      };
      setFormData(initialData);
      setOriginalData(initialData);
    }
    
    // Fetch subscription data when modal opens
    if (isOpen && userInfo?.id) {
      fetchSubscriptionData();
    }
  }, [userInfo, isOpen]);
  
  // Fetch subscription tier and usage data
  const fetchSubscriptionData = async () => {
    if (!userInfo?.id) return;
    
    setLoadingSubscription(true);
    try {
      const response = await fetch('/api/subscription?action=usage', {
        headers: {
          'x-whop-user-id': userInfo.id
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!hasChanges || isSaving) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      if (onSave) {
        await onSave(formData);
        setSuccessMessage('Settings saved successfully!');
        
        // Update original data to reflect saved state
        setOriginalData({ ...formData });
        setHasChanges(false);
        
        // Close modal after a brief delay to show success message
        setTimeout(() => {
          onClose();
          setSuccessMessage(null);
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setError(error.message || 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original data
    setFormData({ ...originalData });
    setHasChanges(false);
    setError(null);
    setSuccessMessage(null);
    onClose();
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
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
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
            maxWidth: '28rem',
            margin: '0 1rem'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-6 border-b border-gray-700"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.5rem',
              borderBottom: '1px solid rgba(107, 114, 128, 0.3)'
            }}
          >
            <h2 
              className="text-xl font-semibold text-white"
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#ffffff'
              }}
            >
              Settings
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-white transition-colors duration-200"
              style={{
                color: '#9ca3af',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <div 
            className="p-6 space-y-4"
            style={{
              padding: '1.5rem'
            }}
          >
            {/* Error Message */}
            {error && (
              <div 
                className="p-3 bg-red-900 border border-red-700 rounded-md text-red-200 text-sm"
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#7f1d1d',
                  border: '1px solid #b91c1c',
                  borderRadius: '0.375rem',
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
                className="p-3 bg-green-900 border border-green-700 rounded-md text-green-200 text-sm"
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#14532d',
                  border: '1px solid #16a34a',
                  borderRadius: '0.375rem',
                  color: '#bbf7d0',
                  fontSize: '0.875rem'
                }}
              >
                {successMessage}
              </div>
            )}
            {/* Display Name Field */}
            <div>
              <label 
                className="block text-sm font-medium text-gray-300 mb-2"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#d1d5db',
                  marginBottom: '0.5rem'
                }}
              >
                <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: '0.375rem',
                  color: '#ffffff',
                  fontSize: '0.875rem'
                }}
                placeholder="Enter your display name"
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
                  {subscriptionData.utilization.dailyMessages.limit > 0 && (
                    <div 
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '0.25rem',
                        height: '0.25rem',
                        marginTop: '0.25rem'
                      }}
                    >
                      <div 
                        style={{
                          width: `${Math.min(subscriptionData.utilization.dailyMessages.percentage, 100)}%`,
                          backgroundColor: subscriptionData.utilization.dailyMessages.percentage > 80 ? '#ef4444' : '#10b981',
                          height: '100%',
                          borderRadius: '0.25rem',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                  )}
                </div>
                
                {subscriptionData.usage.tier === 'free' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      Upgrade for unlimited messages and advanced features
                    </span>
                  </div>
                )}
              </div>
            )}

            {loadingSubscription && (
              <div 
                style={{
                  padding: '1rem',
                  backgroundColor: '#374151',
                  borderRadius: '0.5rem',
                  textAlign: 'center',
                  color: '#9ca3af',
                  fontSize: '0.875rem'
                }}
              >
                Loading subscription info...
              </div>
            )}

            {/* Email Field */}
            <div>
              <label 
                className="block text-sm font-medium text-gray-300 mb-2"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#d1d5db',
                  marginBottom: '0.5rem'
                }}
              >
                <Mail size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: '0.375rem',
                  color: '#ffffff',
                  fontSize: '0.875rem'
                }}
                placeholder="Enter your email address"
              />
              <p 
                className="text-xs text-gray-500 mt-1"
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginTop: '0.25rem'
                }}
              >
                Optional: Used for enhanced AI personalization
              </p>
            </div>
          </div>

          {/* Footer */}
          <div 
            className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-700"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              padding: '1rem 1.5rem',
              borderTop: '1px solid rgba(107, 114, 128, 0.3)'
            }}
          >
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#d1d5db',
                cursor: 'pointer',
                borderRadius: '0.375rem'
              }}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: hasChanges && !isSaving ? '#2563eb' : '#4b5563',
                border: 'none',
                color: '#ffffff',
                cursor: hasChanges && !isSaving ? 'pointer' : 'not-allowed',
                borderRadius: '0.375rem',
                opacity: hasChanges && !isSaving ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {isSaving ? (
                <>
                  <div 
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid #ffffff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CSS for loading spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}