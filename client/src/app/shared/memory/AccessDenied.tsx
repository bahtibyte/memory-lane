import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-[#0E0E0E] p-4 md:p-8">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-[#1A1A1A] border border-[#242424] rounded-lg p-4 md:p-8 max-w-2xl w-full mx-auto text-center">
          <div className="w-14 h-14 md:w-20 md:h-20 bg-red-300/10 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
            <svg
              className="w-7 h-7 md:w-10 md:h-10 text-red-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl md:text-3xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 text-sm md:text-base mb-6 md:mb-8">
            You don&apos;t have permission to access this page. Please log in again or ask the owner to add you as a friend.
          </p>
          <div className="flex flex-col gap-3 md:flex-row md:gap-4 justify-center items-center">
            <Link
              href="/authentication"
              className="inline-flex px-6 md:px-8 py-2.5 md:py-3 bg-purple-300 text-black rounded-lg hover:bg-purple-400 transition-colors font-medium text-sm md:text-base whitespace-nowrap"
            >
              Log In
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