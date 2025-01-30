import Link from "next/link";

export default function PageNotFound() {
  return (
    <div className="min-h-screen p-4 md:p-8 bg-[rgb(30,30,30)] flex flex-col items-center justify-center">
      <h1 className="text-white text-2xl mb-4">Page not found</h1>
      <Link href="/" className="text-[#CCC7F8] hover:text-white underline">
        Go back to home page
      </Link>
    </div>
  );
}