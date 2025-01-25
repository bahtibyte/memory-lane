// This will be your landing page
export default function LandingPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl mb-8">Welcome to Photo Timeline</h1>
      <div className="flex gap-4">
        <a 
          href="/create-group" 
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Create New Group
        </a>
        <a 
          href="/timeline/test" 
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          View Timeline
        </a>
      </div>
    </main>
  );
}