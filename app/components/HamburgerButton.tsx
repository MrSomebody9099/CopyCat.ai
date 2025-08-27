"use client";
import { Menu, X } from 'lucide-react';

interface HamburgerButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export default function HamburgerButton({ onClick, isOpen }: HamburgerButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 left-4 z-40 p-3 rounded-lg transition-all duration-200 hover:bg-sidebar-accent lg:hidden"
      style={{
        backgroundColor: 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(8px)',
        borderRadius: '8px'
      }}
      suppressHydrationWarning
    >
      {isOpen ? (
        <X className="w-5 h-5 text-sidebar-foreground" />
      ) : (
        <Menu className="w-5 h-5 text-sidebar-foreground" />
      )}
    </button>
  );
}