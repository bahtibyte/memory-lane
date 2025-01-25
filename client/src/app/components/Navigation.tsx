import Link from 'next/link';

export default function Navigation() {
    return (
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex gap-6">
          <Link href="/" className="hover:text-gray-300">Home</Link>
          <Link href="/create-group" className="hover:text-gray-300">Create Group</Link>
          <Link href="/timeline" className="hover:text-gray-300">Timeline</Link>
        </div>
      </nav>
    );
  }