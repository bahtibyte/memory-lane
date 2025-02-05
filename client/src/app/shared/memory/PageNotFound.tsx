import Link from "next/link";

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-[#0E0E0E] p-4 md:p-8">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-[#1A1A1A] border border-[#242424] rounded-lg p-4 md:p-8 max-w-2xl w-full mx-auto text-center">
          <div className="w-14 h-14 md:w-20 md:h-20 bg-yellow-300/10 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
            <svg
              className="w-7 h-7 md:w-10 md:h-10 text-yellow-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl md:text-3xl font-bold text-white mb-2">Memory Lane Not Found</h2>
          <p className="text-gray-400 text-sm md:text-base mb-6 md:mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. You can check your groups or return to the home page.
          </p>
          <div className="flex flex-col gap-3 md:flex-row md:gap-4 justify-center items-center">
            <Link
              href="/my-groups"
              className="inline-flex px-6 md:px-8 py-2.5 md:py-3 bg-purple-300 text-black rounded-lg hover:bg-purple-400 transition-colors font-medium text-sm md:text-base whitespace-nowrap"
            >
              My Groups
            </Link>
            <Link
              href="/"
              className="inline-flex px-6 md:px-8 py-2.5 md:py-3 bg-[#242424] text-purple-300 rounded-lg hover:bg-[#2A2A2A] transition-colors font-medium items-center justify-center text-sm md:text-base whitespace-nowrap"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}