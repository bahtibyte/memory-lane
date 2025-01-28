import Link from 'next/link';

// This will be your landing page
export default function LandingPage() {
  return (
    <main className="min-h-screen p-8 flex flex-col items-center justify-center">
      <h1 className="text-4xl mb-8">Welcome to Photo Timeline</h1>
      <div className="flex flex-col gap-4 items-center">
        <Link
          href="/create-group"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Create New Group
        </Link>
      </div>
    </main>
  );
}