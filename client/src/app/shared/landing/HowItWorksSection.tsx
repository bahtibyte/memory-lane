"use client";

interface SecondSectionProps {
  activeSection: string;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>, index: number) => void;
  setActiveCard: (index: number | null) => void;
  getCardStyle: (index: number) => React.CSSProperties;
}

export default function SecondSection({ activeSection, handleMouseMove, setActiveCard, getCardStyle }: SecondSectionProps) {
  return (
    <section className={`min-h-[80vh] bg-black px-4 md:px-8 py-12 md:py-20 mb-8 transition-all duration-1000 ease-in-out transform ${activeSection === 'second' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}>
      <div className="w-[95%] md:w-[80%] max-w-[95%] md:max-w-[80%] mx-auto">
        {/* Headers */}
        <div className="text-left mb-12 md:mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-3 md:mb-4 hover:cursor-default">
            <span className="hover-letter">H</span>
            <span className="hover-letter">o</span>
            <span className="hover-letter">w</span>
            &nbsp;
            <span className="hover-letter">i</span>
            <span className="hover-letter">t</span>
            &nbsp;
            <span className="hover-letter">w</span>
            <span className="hover-letter">o</span>
            <span className="hover-letter">r</span>
            <span className="hover-letter">k</span>
            <span className="hover-letter">s</span>
          </h2>
          <p className="text-[#DCDCDC] text-lg md:text-2xl max-w-2xl hover:cursor-default">
            Simple, seamless, and made for <span className="text-purple-300 bg-clip-text bg-gradient-to-r from-pink-200 to-purple-400 hover:text-transparent transition-colors">sharing</span>.
          </p>
        </div>

        {/* Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 relative">
          {/* Card 1 */}
          <div
            className="relative border border-[#4D4D4D] rounded-xl p-4 md:p-8 py-8 md:py-16 transition-all duration-500 hover:cursor-default overflow-hidden bg-gradient-to-br from-black via-black to-purple-950/30 hover:border-purple-500/50"
            onMouseMove={(e) => handleMouseMove(e, 0)}
            onMouseEnter={() => setActiveCard(0)}
            onMouseLeave={() => setActiveCard(null)}
            style={getCardStyle(0)}
          >
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 md:block md:mb-8">
                <div className="text-[#DCDCDC] text-5xl md:text-7xl font-bold md:mb-8 hover:cursor-default bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text hover:text-transparent transition-colors">1</div>
                <h3 className="text-[#DCDCDC] ml-2 text-3xl md:text-4xl font-bold md:mb-8 hover:cursor-default group-hover:text-purple-300 transition-colors flex items-center gap-2">
                  Create a Timeline
                </h3>
              </div>
              <p className="text-[#DCDCDC] text-lg md:text-xl hover:cursor-default">
                Create a timeline to capture and share your group&apos;s best moments
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div
            className="relative border border-[#4D4D4D] rounded-xl p-4 md:p-8 py-8 md:py-16 transition-all duration-500 hover:cursor-default overflow-hidden bg-gradient-to-br from-black via-black to-purple-950/30 hover:border-purple-500/50"
            onMouseMove={(e) => handleMouseMove(e, 1)}
            onMouseEnter={() => setActiveCard(1)}
            onMouseLeave={() => setActiveCard(null)}
            style={getCardStyle(1)}
          >
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 md:block md:mb-8">
                <div className="text-[#DCDCDC] text-5xl md:text-7xl font-bold md:mb-8 hover:cursor-default bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text hover:text-transparent transition-colors">2</div>
                <h3 className="text-[#DCDCDC]  ml-2 text-3xl md:text-4xl font-bold md:mb-8 hover:cursor-default group-hover:text-purple-300 transition-colors flex items-center gap-2">
                  Upload Photos
                </h3>
              </div>
              <p className="text-[#DCDCDC] text-lg md:text-xl hover:cursor-default">
                Upload photos and tell the story behind them using captions
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div
            className="relative border border-[#4D4D4D] rounded-xl p-4 md:p-8 py-8 md:py-16 transition-all duration-500 hover:cursor-default overflow-hidden bg-gradient-to-br from-black via-black to-purple-950/30 hover:border-purple-500/50"
            onMouseMove={(e) => handleMouseMove(e, 2)}
            onMouseEnter={() => setActiveCard(2)}
            onMouseLeave={() => setActiveCard(null)}
            style={getCardStyle(2)}
          >
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 md:block md:mb-8">
                <div className="text-[#DCDCDC] text-5xl md:text-7xl font-bold md:mb-8 hover:cursor-default bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text hover:text-transparent transition-colors">3</div>
                <h3 className="text-[#DCDCDC] ml-2 text-3xl md:text-4xl font-bold md:mb-8 hover:cursor-default group-hover:text-purple-300 transition-colors flex items-center gap-2">
                  Invite Your Friends
                </h3>
              </div>
              <p className="text-[#DCDCDC] text-lg md:text-xl hover:cursor-default">
                Share your timeline with friends for synchronized photo uploads
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}