import { LinkIcon, LockClosedIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface ThirdSectionProps {
    activeSection: string;
    handleMouseMove: (e: React.MouseEvent<HTMLDivElement>, index: number) => void;
    setActiveCard: (index: number | null) => void;
    getCardStyle: (index: number) => React.CSSProperties;
}

export default function ThirdSection({ activeSection, handleMouseMove, setActiveCard, getCardStyle }: ThirdSectionProps) {
  return (
    <section className={`min-h-screen bg-black px-4 md:px-8 pt-24 md:pt-32 transition-all duration-1000 ease-in-out transform ${
      activeSection === 'third' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
    }`}>
      <div className="w-[95%] md:w-[80%] max-w-[95%] md:max-w-[80%] mx-auto">
        {/* Headers */}
        <div className="text-left mb-12 md:mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-3 md:mb-4 hover:cursor-default">
            <span className="hover-letter">O</span>
            <span className="hover-letter">u</span>
            <span className="hover-letter">r</span>
            &nbsp;
            <span className="hover-letter">f</span>
            <span className="hover-letter">e</span>
            <span className="hover-letter">a</span>
            <span className="hover-letter">t</span>
            <span className="hover-letter">u</span>
            <span className="hover-letter">r</span>
            <span className="hover-letter">e</span>
            <span className="hover-letter">s</span>
          </h2>
          <p className="text-[#DCDCDC] text-lg md:text-2xl max-w-2xl hover:cursor-default">
            Not just storage—your <span className="text-purple-300 bg-clip-text bg-gradient-to-r from-pink-200 to-purple-400 hover:text-transparent transition-colors">memories</span>, beautifully told.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {/* Feature 1 */}
          <div
            className="relative border border-[#4D4D4D] rounded-xl p-4 md:p-8 py-8 md:py-16 transition-all duration-500 hover:cursor-default overflow-hidden bg-gradient-to-br from-black via-black to-purple-950/30 hover:border-purple-500/50"
            onMouseMove={(e) => handleMouseMove(e, 3)}
            onMouseEnter={() => setActiveCard(3)}
            onMouseLeave={() => setActiveCard(null)}
            style={getCardStyle(3)}
          >
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 md:block md:mb-8">
                <LinkIcon className="w-8 h-8 md:w-12 md:h-12 text-white" />
                <h3 className="text-[#DCDCDC] ml-2 md:ml-0 md:mt-4 text-2xl md:text-4xl font-bold hover:cursor-default group-hover:text-purple-300 transition-colors">
                  Simple, Sharable URL
                </h3>
              </div>
              <p className="text-[#DCDCDC] text-base md:text-xl hover:cursor-default">
                Access your timeline anywhere with a link
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div
            className="relative border border-[#4D4D4D] rounded-xl p-4 md:p-8 py-8 md:py-16 transition-all duration-500 hover:cursor-default overflow-hidden bg-gradient-to-br from-black via-black to-purple-950/30 hover:border-purple-500/50"
            onMouseMove={(e) => handleMouseMove(e, 4)}
            onMouseEnter={() => setActiveCard(4)}
            onMouseLeave={() => setActiveCard(null)}
            style={getCardStyle(4)}
          >
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 md:block md:mb-8">
                <LockClosedIcon className="w-8 h-8 md:w-12 md:h-12 text-white" />
                <h3 className="text-[#DCDCDC] ml-2 md:ml-0 md:mt-4 text-2xl md:text-4xl font-bold hover:cursor-default group-hover:text-purple-300 transition-colors">
                  Public or Private
                </h3>
              </div>
              <p className="text-[#DCDCDC] text-base md:text-xl hover:cursor-default">
                Keep it open or lock it with a passcode
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div
            className="relative border border-[#4D4D4D] rounded-xl p-4 md:p-8 py-8 md:py-16 transition-all duration-500 hover:cursor-default overflow-hidden bg-gradient-to-br from-black via-black to-purple-950/30 hover:border-purple-500/50"
            onMouseMove={(e) => handleMouseMove(e, 5)}
            onMouseEnter={() => setActiveCard(5)}
            onMouseLeave={() => setActiveCard(null)}
            style={getCardStyle(5)}
          >
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 md:block md:mb-8">
                <ChatBubbleLeftRightIcon className="w-8 h-8 md:w-12 md:h-12 text-white" />
                <h3 className="text-[#DCDCDC] ml-2 md:ml-0 md:mt-4 text-2xl md:text-4xl font-bold hover:cursor-default group-hover:text-purple-300 transition-colors">
                  Comment on Photos
                </h3>
              </div>
              <p className="text-[#DCDCDC] text-base md:text-xl hover:cursor-default">
                Share reactions and keep the memories alive
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}