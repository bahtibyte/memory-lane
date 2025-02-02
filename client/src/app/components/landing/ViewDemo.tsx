"use client";

import Link from 'next/link';

export default function ViewDemo() {
  return (
    <div className="view-demo-container">
      <Link
        href="/demo"
        className="view-demo-button px-6 py-4 text-lg bg-black border-2 text-purple-300 rounded-full"
      >
        VIEW DEMO
      </Link>
      <style jsx global>{`
        .view-demo-button {
          transition: all 0.3s ease-in-out;
          display: inline-block;
          border-color: #D8B4FE;
        }
        .view-demo-button:hover {
          transform: scale(1.03);
          border-color: #E4CAFF;
          color: #E4CAFF;
        }
      `}</style>
    </div>
  );
}