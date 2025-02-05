import GetStarted from "./GetStarted";
import ViewDemo from "./ViewDemo";

export default function LandingSection() {
  return (
    <div className="relative flex flex-col w-[80%] max-w-[80%]">
      {/* Left-Aligned Text */}
      <div className="text-left pr-6 pl-[5%] mb-12">
        <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold hover:cursor-default">
          <span className="hover-letter">M</span>
          <span className="hover-letter">E</span>
          <span className="hover-letter">M</span>
          <span className="hover-letter">O</span>
          <span className="hover-letter">R</span>
          <span className="hover-letter">Y</span>
        </h1>
      </div>

      {/* Timeline (Horizontal Line with Buttons) */}
      <div className="relative w-full flex items-center mb-12">
        {/* Horizontal Line */}
        <div className="w-full h-[3px] bg-purple-300 relative">
          {/* Left Dot */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-purple-300"></div>

          {/* Right Dot */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-purple-300"></div>
        </div>

        {/* Buttons Positioned on Top of the Line & Shifted Right */}
        <div className="absolute right-16 flex gap-8">
          <GetStarted />
          <ViewDemo />
        </div>
      </div>

      {/* Left-Aligned "LANE" */}
      <div className="text-left pr-6 pl-[5%] mb-12">
        <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold hover:cursor-default">
          <span className="hover-letter">L</span>
          <span className="hover-letter">A</span>
          <span className="hover-letter">N</span>
          <span className="hover-letter">E</span>
        </h1>
      </div>

      {/* Description Below Everything */}
      <p className="text-[#DCDCDC] text-lg lg:text-xl text-left pl-[5%] max-w-2xl hover:cursor-default">
        Your friend group&apos;s journey, captured in a <span className="text-purple-300 bg-clip-text bg-gradient-to-r from-pink-200 to-purple-400 hover:text-transparent transition-colors hover:cursor-default">timeline</span>.
      </p>
    </div>
  );
}