"use client";

import { useAuth } from "@/core/context/auth-provider";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GetStarted() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (isLoading) {
      // Capture mouse position
      setMousePos({ x: e.clientX, y: e.clientY });
      setShowLoadingMessage(true);
      setTimeout(() => setShowLoadingMessage(false), 1500);
      return;
    }

    router.push(isAuthenticated ? "/my-groups" : "/authentication");
  };

  return (
    <div className="flex flex-col gap-4 items-center relative">
      {showLoadingMessage && (
        <div 
          className="fixed bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-md text-sm shadow-lg z-50"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y - 60}px`, // Position above the cursor
            transform: 'translateX(-50%)', // Center horizontally
            pointerEvents: 'none', // Prevent the tooltip from interfering with clicks
          }}
        >
          Still loading, please wait and try again
        </div>
      )}
      <button
        onClick={handleClick}
        className="px-6 py-3 text-lg bg-gradient-to-r from-pink-200 to-purple-400 text-black rounded-full hover:from-pink-100 hover:to-purple-300 transition-all border-none outline-none"
      >
        Get Started
      </button>
    </div>
  );
}