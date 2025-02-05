"use client";

interface SecondSectionProps {
  activeSection: string;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>, index: number) => void;
  setActiveCard: (index: number | null) => void;
  getCardStyle: (index: number) => React.CSSProperties;
}

export default function SecondSection({ activeSection, handleMouseMove, setActiveCard, getCardStyle }: SecondSectionProps) {
  return (
    <section className={`min-h-[80vh] bg-black px-8 py-20 mb-8 transition-all duration-1000 ease-in-out transform ${activeSection === 'second'
      ? 'opacity-100 translate-y-0'
      : 'opacity-0 translate-y-20'
      }`}>
      <div className="w-[80%] max-w-[80%] mx-auto">
        {/* Headers */}
        <div className="text-left mb-20">
          <h2 className="text-6xl md:text-7xl font-bold text-white mb-4 hover:cursor-default">
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
          <p className="text-[#DCDCDC] text-xl md:text-2xl max-w-2xl hover:cursor-default">
            Simple, seamless, and made for sharing.
          </p>
        </div>

        {/* Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Card 1 */}
          <div
            className="relative border border-[#4D4D4D] rounded-xl p-8 py-16 transition-all duration-500 hover:cursor-default overflow-hidden"
            onMouseMove={(e) => handleMouseMove(e, 0)}
            onMouseEnter={() => setActiveCard(0)}
            onMouseLeave={() => setActiveCard(null)}
            style={getCardStyle(0)}
          >
            <div className="relative z-10">
              <div className="text-[#DCDCDC] text-7xl font-bold mb-8 hover:cursor-default">1</div>
              <h3 className="text-[#DCDCDC] text-4xl font-bold mb-8 hover:cursor-default">Create a Timeline</h3>
              <p className="text-[#DCDCDC] text-xl hover:cursor-default">
                Create a timeline to capture and share your group&apos;s best moments
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div
            className="relative border border-[#4D4D4D] rounded-xl p-8 py-16 transition-all duration-500 hover:cursor-default overflow-hidden"
            onMouseMove={(e) => handleMouseMove(e, 1)}
            onMouseEnter={() => setActiveCard(1)}
            onMouseLeave={() => setActiveCard(null)}
            style={getCardStyle(1)}
          >
            <div className="relative z-10">
              <div className="text-[#DCDCDC] text-7xl font-bold mb-8 hover:cursor-default">2</div>
              <h3 className="text-[#DCDCDC] text-4xl font-bold mb-8 hover:cursor-default">Upload Photos</h3>
              <p className="text-[#DCDCDC] text-xl hover:cursor-default">
                Upload photos and tell the story behind them using captions
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div
            className="relative border border-[#4D4D4D] rounded-xl p-8 py-16 transition-all duration-500 hover:cursor-default overflow-hidden"
            onMouseMove={(e) => handleMouseMove(e, 2)}
            onMouseEnter={() => setActiveCard(2)}
            onMouseLeave={() => setActiveCard(null)}
            style={getCardStyle(2)}
          >
            <div className="relative z-10">
              <div className="text-[#DCDCDC] text-7xl font-bold mb-8 hover:cursor-default">3</div>
              <h3 className="text-[#DCDCDC] text-4xl font-bold mb-8 hover:cursor-default">Invite Your Friends</h3>
              <p className="text-[#DCDCDC] text-xl hover:cursor-default">
                Share your timeline with friends for synchronized photo uploads
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}