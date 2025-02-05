import Link from "next/link";

export default function PageNotFound() {
  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#0E0E0E] flex flex-col items-center justify-center">
      <h1 className="text-white text-2xl mb-4">Page not found</h1>
      <Link href="/" className="text-purple-300 hover:text-purple-400 underline">
        Go back to home page
      </Link>
    </div>
  );
}