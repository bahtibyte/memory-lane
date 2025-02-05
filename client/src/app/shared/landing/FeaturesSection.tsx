
interface ThirdSectionProps {
    activeSection: string;
    handleMouseMove: (e: React.MouseEvent<HTMLDivElement>, index: number) => void;
    setActiveCard: (index: number | null) => void;
    getCardStyle: (index: number) => React.CSSProperties;
}

export default function ThirdSection({ activeSection, handleMouseMove, setActiveCard, getCardStyle }: ThirdSectionProps) {
  return (
    <section className={`min-h-[80vh] bg-black px-8 pt-0 pb-20 transition-all duration-1000 ease-in-out transform ${activeSection === 'third'
      ? 'opacity-100 translate-y-0'
      : 'opacity-0 translate-y-20'
      }`}>
      <div className="w-[80%] max-w-[80%] mx-auto">
        {/* Headers */}
        <div className="text-left mb-20">
          <h2 className="text-6xl md:text-7xl font-bold text-white mb-4 hover:cursor-default">
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
          <p className="text-[#DCDCDC] text-xl md:text-2xl max-w-2xl hover:cursor-default">
            Not just storage—your memories, beautifully told.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div
            className="relative border border-[#4D4D4D] rounded-xl p-8 py-16 transition-all duration-500 hover:cursor-default overflow-hidden"
            onMouseMove={(e) => handleMouseMove(e, 3)}
            onMouseEnter={() => setActiveCard(3)}
            onMouseLeave={() => setActiveCard(null)}
            style={getCardStyle(3)}
          >
            <div className="text-[#DCDCDC] text-4xl mb-8">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.9 12C3.9 10.29 5.29 8.9 7 8.9H11V7H7C4.24 7 2 9.24 2 12C2 14.76 4.24 17 7 17H11V15.1H7C5.29 15.1 3.9 13.71 3.9 12ZM8 13H16V11H8V13ZM17 7H13V8.9H17C18.71 8.9 20.1 10.29 20.1 12C20.1 13.71 18.71 15.1 17 15.1H13V17H17C19.76 17 22 14.76 22 12C22 9.24 19.76 7 17 7Z" fill="currentColor" />
              </svg>
            </div>
            <h3 className="text-[#DCDCDC] text-4xl font-bold mb-8 hover:cursor-default leading-tight">
              Simple, Sharable<br />URL
            </h3>
            <p className="text-[#DCDCDC] text-xl hover:cursor-default">
              Access your timeline anywhere with a link
            </p>
          </div>

          {/* Feature 2 */}
          <div
            className="relative border border-[#4D4D4D] rounded-xl p-8 py-16 transition-all duration-500 hover:cursor-default overflow-hidden"
            onMouseMove={(e) => handleMouseMove(e, 4)}
            onMouseEnter={() => setActiveCard(4)}
            onMouseLeave={() => setActiveCard(null)}
            style={getCardStyle(4)}
          >
            <div className="text-[#DCDCDC] text-4xl mb-8">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" fill="currentColor" />
              </svg>
            </div>
            <h3 className="text-[#DCDCDC] text-4xl font-bold mb-8 hover:cursor-default leading-tight">
              Public or<br />Private
            </h3>
            <p className="text-[#DCDCDC] text-xl hover:cursor-default">
              Keep it open or lock it with a passcode
            </p>
          </div>

          {/* Feature 3 */}
          <div
            className="relative border border-[#4D4D4D] rounded-xl p-8 py-16 transition-all duration-500 hover:cursor-default overflow-hidden"
            onMouseMove={(e) => handleMouseMove(e, 5)}
            onMouseEnter={() => setActiveCard(5)}
            onMouseLeave={() => setActiveCard(null)}
            style={getCardStyle(5)}
          >
            <div className="text-[#DCDCDC] text-4xl mb-8">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16ZM11 12H13V14H11V12ZM11 6H13V10H11V6Z" fill="currentColor" />
              </svg>
            </div>
            <h3 className="text-[#DCDCDC] text-4xl font-bold mb-8 hover:cursor-default leading-tight">
              Comment<br />on Photos
            </h3>
            <p className="text-[#DCDCDC] text-xl hover:cursor-default">
              Share reactions and keep the memories alive
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}