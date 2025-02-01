import Link from 'next/link';
import GetStarted from './components/landing/GetStarted';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black px-8">
      {/* Top-right navigation */}
      <div className="absolute top-4 right-4 flex gap-4">
        <Link
          href="/contributors"
          className="px-4 py-2 text-sm text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
        >
          OUR CONTRIBUTORS
        </Link>
        <Link
          href="https://github.com/bahtibyte/memory-lane"
          target="_blank"
          className="px-4 py-2 text-sm text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
        >
          GITHUB REPO
        </Link>
      </div>

      {/* Main Section */}
      <div className="relative flex flex-col w-full max-w-4xl">
        {/* Left-Aligned Text */}
        <div className="text-left pr-6 pl-[5%]">
          <h1 className="text-white text-6xl lg:text-7xl xl:text-8xl font-bold">MEMORY</h1>
        </div>

        {/* Timeline (Horizontal Line with Buttons) */}
        <div className="relative w-full flex items-center mt-2 mb-4">
          {/* Horizontal Line */}
          <div className="w-full h-[3px] bg-purple-300 relative">
            {/* Left Dot */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-purple-300"></div>

            {/* Right Dot */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-purple-300"></div>
          </div>

          {/* Buttons Positioned on Top of the Line & Shifted Right */}
          <div className="absolute right-10 flex gap-4">
            <GetStarted />

            <Link
              href="/demo"
              className="px-6 py-3 text-lg bg-black border-2 border-purple-300 text-purple-300 rounded-full hover:bg-purple-300 hover:text-black transition-colors"
            >
              VIEW DEMO
            </Link>
          </div>
        </div>

        {/* Left-Aligned "LANE" */}
        <div className="text-left pr-6 pl-[5%]">
          <h1 className="text-white text-6xl lg:text-7xl xl:text-8xl font-bold">LANE</h1>
        </div>

        {/* Description Below Everything */}
        <p className="mt-6 text-gray-400 text-lg lg:text-xl text-left pl-[5%] max-w-2xl">
          Your friend group&apos;s journey, captured in a <span className="text-purple-300 bg-clip-text bg-gradient-to-r from-pink-200 to-purple-400 hover:text-transparent transition-colors cursor-pointer">timeline</span>.
        </p>
      </div>
    </main>
  );
}
