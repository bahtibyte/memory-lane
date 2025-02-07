import GetStarted from "./GetStarted";
import ViewDemo from "./ViewDemo";

export default function LandingSection() {
  return (
    <div className="relative flex flex-col w-screen min-w-full">
      <div className="flex flex-col  w-[95%] md:w-[80%] mx-auto">
        {/* Left-Aligned Text */}
        <div className="text-left pr-6 pl-[5%] mb-4 md:mb-12">
          <h1 className="text-6xl md:text-7xl xl:text-8xl font-bold hover:cursor-default">
            <span className="hover-letter">M</span>
            <span className="hover-letter">E</span>
            <span className="hover-letter">M</span>
            <span className="hover-letter">O</span>
            <span className="hover-letter">R</span>
            <span className="hover-letter">Y</span>
          </h1>
        </div>

        {/* Timeline for medium screens and up - Original position */}
        <div className="hidden md:flex relative w-full items-center mb-12">
          {/* Horizontal Line */}
          <div className="w-full h-[3px] bg-purple-300 relative">
            {/* Left Dot */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-purple-300"></div>
            {/* Right Dot */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-purple-300"></div>
          </div>
          <div className="absolute right-16 flex gap-8">
            <GetStarted />
            <ViewDemo />
          </div>
        </div>

        {/* Left-Aligned "LANE" */}
        <div className="text-left pr-6 pl-[5%] mb-4 md:mb-12">
          <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold hover:cursor-default">
            <span className="hover-letter">L</span>
            <span className="hover-letter">A</span>
            <span className="hover-letter">N</span>
            <span className="hover-letter">E</span>
          </h1>
        </div>

        {/* Timeline for small screens - Below LANE */}
        <div className="md:hidden relative w-full flex items-center mb-12 pt-8">
          {/* Horizontal Line */}
          <div className="w-full h-[3px] bg-purple-300 relative">
            {/* Left Dot */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-purple-300"></div>
            {/* Right Dot */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-purple-300"></div>
          </div>
          <div className="absolute right-8 flex gap-4">
            <GetStarted />
            <ViewDemo />
          </div>
        </div>


        {/* Description Below Everything */}
        <p className="text-[#DCDCDC] text-lg lg:text-xl text-left pl-[5%] max-w-2xl hover:cursor-default">
          Your friend group&apos;s journey, captured in a <span className="text-purple-300 bg-clip-text bg-gradient-to-r from-pink-200 to-purple-400 hover:text-transparent transition-colors hover:cursor-default">timeline</span>.
        </p>
      </div>
    </div>
  );
}