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
    </div>
  );
}