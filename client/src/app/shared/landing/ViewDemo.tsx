"use client";

import Link from 'next/link';

export default function ViewDemo() {
  return (
    <div className="view-demo-container">
      <Link
        href="/demo"
        className="view-demo-button px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg bg-black border-2 text-purple-300 rounded-full whitespace-nowrap"
      >
        VIEW DEMO
      </Link>
    </div>
  );
}