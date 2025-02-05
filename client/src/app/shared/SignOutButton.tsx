import React from 'react';

interface SignOutButtonProps {
  onSignOut: () => void;
}

export default function SignOutButton({ onSignOut }: SignOutButtonProps) {
  return (
    <button
      onClick={onSignOut}
      className="flex items-center gap-2 px-4 py-2 bg-[#242424] hover:bg-[#2A2A2A] text-purple-300 rounded-lg transition-colors text-sm sm:text-base"
    >
      <span>Sign Out</span>
      <svg 
        className="w-4 h-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
        />
      </svg>
    </button>
  );
}