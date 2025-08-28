"use client";
import { useEffect } from 'react';
import { Settings, Plus } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsClick?: () => void;
  onNewChatClick?: () => void;
}

export default function Sidebar({ isOpen, onClose, onSettingsClick, onNewChatClick }: SidebarProps) {
  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const historyButton = document.getElementById('history-button');
      
      if (isOpen && 
          sidebar && 
          !sidebar.contains(event.target as Node) &&
          historyButton &&
          !historyButton.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40
          }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`fixed top-0 left-0 h-full bg-gray-900 text-white shadow-lg z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '300px',
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
          zIndex: 50,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)'
        }}
      >
        {/* Sidebar Header */}
        <header className="py-4">
          <div 
            className="flex items-center justify-between px-6"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 1.5rem'
            }}
          >
            <h2 
              className="text-xl font-semibold"
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#ffffff'
              }}
            >
              Chats
            </h2>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200"
              style={{
                color: '#9ca3af',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem'
              }}
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{ width: '1.5rem', height: '1.5rem' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Line matching main page position */}
          <div 
            className="mt-2"
            style={{
              height: '1px',
              width: '100%',
              backgroundColor: '#6b7280',
              marginTop: '0.5rem',
              position: 'relative'
            }}
          ></div>
        </header>

        {/* Sidebar Content */}
        <div 
          className="flex-1 flex flex-col"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 120px)' // Account for header height
          }}
        >
          {/* New Chat Button */}
          <div 
            className="px-6 pb-4"
            style={{
              padding: '0 1.5rem 1rem 1.5rem'
            }}
          >
            <button
              onClick={onNewChatClick}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-all duration-200 text-left"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <Plus size={18} style={{ minWidth: '18px' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>New Chat</span>
            </button>
          </div>

          {/* Chat List Area */}
          <div 
            className="flex-1 px-6"
            style={{
              flex: 1,
              padding: '0 1.5rem',
              overflowY: 'auto'
            }}
          >
            {/* Placeholder content - chat history will be added here */}
            <div 
              className="text-gray-400 text-center"
              style={{
                color: '#9ca3af',
                textAlign: 'center',
                padding: '2rem 0'
              }}
            >
              <p>No previous chats</p>
            </div>
          </div>

          {/* Settings Button - Fixed at bottom */}
          <div 
            className="px-2 py-2 border-t border-gray-700"
            style={{
              padding: '0.5rem',
              borderTop: '1px solid rgba(107, 114, 128, 0.3)'
            }}
          >
            <button
              onClick={onSettingsClick}
              className="w-full flex items-center gap-3 hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200 text-left"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1.5rem 2.5rem',
                backgroundColor: 'transparent',
                borderRadius: '0.5rem',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none',
                userSelect: 'none',
                minHeight: '5rem',
                fontSize: '1rem',
                fontWeight: '500',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              <Settings size={22} style={{ minWidth: '22px', pointerEvents: 'none' }} />
              <span style={{ pointerEvents: 'none' }}>Settings</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}