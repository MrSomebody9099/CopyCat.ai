"use client";
import { useEffect, useState } from 'react';
import ClientOnlyInput from './ClientOnlyInput';

interface ChatInputSectionProps {
  userInput: string;
  setUserInput: (value: string) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  generate: () => void;
  disabled: boolean;
  placeholder: string;
  isClient: boolean;
  isSidebarOpen?: boolean; // Add sidebar state prop
}

export default function ChatInputSection({
  userInput,
  setUserInput,
  handleKeyPress,
  generate,
  disabled,
  placeholder,
  isClient,
  isSidebarOpen = false // Default to false
}: ChatInputSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder during SSR
    return (
      <div 
        className="fixed bottom-6 left-0 right-0 flex justify-center px-4"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          left: isSidebarOpen ? '280px' : '0', // Adjust left position based on sidebar
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 1rem',
          zIndex: 50
        }}
      >
        <div 
          className="w-full max-w-3xl flex items-center bg-[#1a1a1a] rounded-full px-6 py-4 shadow-lg"
          style={{
            width: '100%',
            maxWidth: '48rem',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#1a1a1a',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '9999px',
            padding: '1rem 1.5rem',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.2)'
          }}
        >
          {/* Placeholder content during SSR */}
          <div style={{ flex: 1, height: '1.125rem' }} />
          <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', backgroundColor: '#6b7280' }} />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed bottom-6 left-0 right-0 flex justify-center px-4"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: isSidebarOpen ? '280px' : '0', // Adjust left position based on sidebar
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 1rem',
        zIndex: 50
      }}
    >
      <div 
        className="w-full max-w-3xl flex items-center bg-[#1a1a1a] rounded-full px-6 py-4 shadow-lg"
        style={{
          width: '100%',
          maxWidth: '48rem',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '9999px',
          padding: '1rem 1.5rem',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.2)',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
        suppressHydrationWarning
      >
        <ClientOnlyInput
          className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg border-none"
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#ffffff',
            fontSize: '1.125rem',
            padding: 0,
            margin: 0,
            boxShadow: 'none'
          }}
          placeholder={placeholder}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          onClick={generate}
          disabled={disabled}
          className={`w-12 h-12 ml-3 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
            disabled 
              ? 'bg-gray-600 cursor-not-allowed opacity-50' 
              : 'bg-white hover:bg-gray-100 hover:scale-105 active:scale-95'
          }`}
          style={{
            width: '3rem',
            height: '3rem',
            marginLeft: '0.75rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
          suppressHydrationWarning
        >
          <svg 
            className={`w-6 h-6 ${disabled ? 'text-gray-400' : 'text-black'}`}
            style={{
              width: '1.5rem',
              height: '1.5rem'
            }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2.5} 
              d="M12 19V5m0 0l-7 7m7-7l7 7" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
}