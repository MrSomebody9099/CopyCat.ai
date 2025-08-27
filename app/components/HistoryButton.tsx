"use client";
import { useState } from 'react';

interface HistoryButtonProps {
  onClick?: () => void;
}

export default function HistoryButton({ onClick }: HistoryButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      id="history-button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed top-6 left-6 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 z-50 ${
        isHovered 
          ? 'bg-white/20 scale-110' 
          : 'bg-white/10 hover:bg-white/15'
      }`}
      style={{
        position: 'fixed',
        top: '1.5rem',
        left: '1.5rem',
        width: '2.5rem',
        height: '2.5rem',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        cursor: 'pointer',
        zIndex: 50
      }}
    >
      {/* 3 Horizontal Lines Icon */}
      <div
        className={`transition-transform duration-200 ${
          isHovered ? 'rotate-12' : ''
        }`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '3px'
        }}
      >
        <div
          style={{
            width: '16px',
            height: '2px',
            backgroundColor: '#000000',
            borderRadius: '1px'
          }}
        />
        <div
          style={{
            width: '16px',
            height: '2px',
            backgroundColor: '#000000',
            borderRadius: '1px'
          }}
        />
        <div
          style={{
            width: '16px',
            height: '2px',
            backgroundColor: '#000000',
            borderRadius: '1px'
          }}
        />
      </div>
    </button>
  );
}