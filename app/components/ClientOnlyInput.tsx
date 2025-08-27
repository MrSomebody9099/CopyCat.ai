"use client";
import { useEffect, useState } from 'react';

interface ClientOnlyInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function ClientOnlyInput({
  value,
  onChange,
  onKeyPress,
  placeholder,
  className,
  style
}: ClientOnlyInputProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder div during SSR to prevent hydration mismatch
    return (
      <div 
        className={className}
        style={style}
      />
    );
  }

  return (
    <input
      type="text"
      className={className}
      style={style}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      suppressHydrationWarning
    />
  );
}