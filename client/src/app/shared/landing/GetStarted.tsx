"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import '@/styles/landing.css';

interface GetStartedProps {
  isLoading: boolean;
  isAuthorized: boolean;
} 

export default function GetStarted({ isLoading, isAuthorized }: GetStartedProps) {
  const router = useRouter();
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (isLoading) {
      setMousePos({ x: e.clientX, y: e.clientY });
      setShowLoadingMessage(true);
      setTimeout(() => setShowLoadingMessage(false), 1500);
      return;
    }

    router.push(isAuthorized ? "/my-groups" : "/authentication");
  };

  return (
    <div className="flex flex-col gap-4 items-center relative">
      {showLoadingMessage && (
        <div
          className="fixed bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-md text-sm shadow-lg z-50"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y - 60}px`,
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}
        >
          Still loading, please wait and try again
        </div>
      )}
      <button
        onClick={handleClick}
        className="get-started-button px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg text-black rounded-full whitespace-nowrap"
      >
        GET STARTED
      </button>
    </div>
  );
}