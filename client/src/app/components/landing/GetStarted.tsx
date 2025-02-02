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
        className="get-started-button px-6 py-4 text-lg text-black rounded-full"
      >
        GET STARTED
      </button>
      <style jsx>{`
        .get-started-button {
          background: linear-gradient(to right, #F5C7EA, #D8B4FE, #D8B4FE, #F5C7EA);
          background-size: 200% 100%;
          background-position: 0 0;
          transition: background-position 0.3s ease-in-out, transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
          font-weight: inherit;
          text-transform: none;
        }
        .get-started-button:hover {
          background-position: 100% 0;
          transform: scale(1.03);
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
          font-weight: inherit;
          text-transform: none;
        }
      `}</style>
    </div>
  );
}