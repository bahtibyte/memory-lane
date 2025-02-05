"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import GetStarted from '@/app/components/landing/GetStarted';
import ViewDemo from '@/app/components/landing/ViewDemo';

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<'first' | 'second' | 'third'>('first');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      if (scrollPosition < windowHeight * 0.2) {
        setActiveSection('first');
      } else if (scrollPosition < windowHeight * 1.1) {
        setActiveSection('second');
      } else {
        setActiveSection('third');
      }

      if (scrollPosition > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardIndex: number) => {
    if (activeCard === cardIndex) {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const getCardStyle = (cardIndex: number) => {
    const gradientColors = {
      0: 'rgba(50, 42, 58, 0.7)',   // Original purple for leftmost
      1: 'rgba(70, 42, 65, 0.5)',   // More subtle mix
      2: 'rgba(90, 42, 72, 0.5)',   // More subtle pink
      3: 'rgba(50, 42, 58, 0.7)',   // Same pattern for features section
      4: 'rgba(70, 42, 65, 0.5)',
      5: 'rgba(90, 42, 72, 0.5)'
    };

    return {
      backgroundImage: activeCard === cardIndex 
        ? `radial-gradient(circle 200px at ${mousePosition.x}px ${mousePosition.y}px, ${gradientColors[cardIndex as keyof typeof gradientColors]}, transparent)`
        : 'none',
      backgroundColor: 'rgba(23, 23, 23, 0.7)',
      transition: 'background-image 0.5s ease-out'
    };
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* Main Section */}
      <main className={`min-h-screen flex flex-col items-center justify-center bg-black px-8 transition-all duration-1000 ease-in-out transform ${
        activeSection === 'first' 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 -translate-y-20'
      }`}>
        {/* Top-right navigation - Back to original position */}
        <div className="absolute top-4 right-4 flex gap-4">
          <Link
            href="/contributors"
            className="nav-button px-4 py-2 text-sm text-white flex items-center gap-2"
          >
            OUR CONTRIBUTORS
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
            </svg>
          </Link>
          <Link
            href="https://github.com/bahtibyte/memory-lane"
            target="_blank"
            className="nav-button px-4 py-2 text-sm text-white flex items-center gap-2"
          >
            GITHUB REPO
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 6.477 2 12C2 16.991 5.571 21.128 10.285 22V18.857C9.705 19.002 9.195 19.002 8.657 18.76C7.915 18.42 7.326 17.577 6.93 16.851C6.715 16.488 6.198 16.086 5.786 16.116L5.734 15.17C6.731 15.083 7.565 15.722 8.058 16.541C8.276 16.907 8.524 17.164 8.858 17.298C9.181 17.427 9.519 17.387 9.934 17.265C9.996 16.623 10.267 16.223 10.497 15.9V15.9C7.726 15.437 6.739 13.847 6.366 12.647C5.89 11.045 6.31 9.036 7.354 7.947C7.378 7.922 7.396 7.891 7.401 7.857C7.406 7.823 7.398 7.789 7.379 7.76C6.947 6.637 7.06 5.17 7.355 4.527C8.193 4.648 9.218 5.183 10.061 5.811C10.135 5.868 10.23 5.885 10.319 5.857C11.413 5.544 12.552 5.392 13.649 5.392C14.749 5.392 15.892 5.544 16.988 5.858C17.077 5.886 17.172 5.869 17.246 5.812C18.088 5.184 19.111 4.649 19.951 4.528C20.246 5.171 20.359 6.636 19.929 7.759C19.91 7.788 19.902 7.822 19.907 7.856C19.912 7.89 19.929 7.921 19.954 7.946C21.012 9.049 21.419 11.078 20.941 12.676C20.566 13.862 19.574 15.441 16.815 15.899V15.899C17.141 16.349 17.5 17.099 17.5 18.099V22C22.215 21.129 25.786 16.992 25.786 12C25.786 6.477 21.309 2 15.786 2H12Z" fill="currentColor"/>
            </svg>
          </Link>
        </div>

        {/* Main Section Content */}
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
      </main>

      {/* Second Section */}
      <section className={`min-h-[80vh] bg-black px-8 py-20 mb-8 transition-all duration-1000 ease-in-out transform ${
        activeSection === 'second' 
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

      {/* Third Section */}
      <section className={`min-h-[80vh] bg-black px-8 pt-0 pb-20 transition-all duration-1000 ease-in-out transform ${
        activeSection === 'third' 
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
                  <path d="M3.9 12C3.9 10.29 5.29 8.9 7 8.9H11V7H7C4.24 7 2 9.24 2 12C2 14.76 4.24 17 7 17H11V15.1H7C5.29 15.1 3.9 13.71 3.9 12ZM8 13H16V11H8V13ZM17 7H13V8.9H17C18.71 8.9 20.1 10.29 20.1 12C20.1 13.71 18.71 15.1 17 15.1H13V17H17C19.76 17 22 14.76 22 12C22 9.24 19.76 7 17 7Z" fill="currentColor"/>
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
                  <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" fill="currentColor"/>
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
                  <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16ZM11 12H13V14H11V12ZM11 6H13V10H11V6Z" fill="currentColor"/>
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

      {/* Breadcrumb Indicators */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
        {['first', 'second', 'third'].map((section) => (
          <div
            key={section}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              activeSection === section 
                ? 'bg-purple-300 scale-125' 
                : 'bg-gray-600 scale-100'
            }`}
          />
        ))}
      </div>

      {/* Return to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 bg-[#4D4D4D] hover:bg-[#666666] text-white p-4 rounded-full transition-all duration-300 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Return to top"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8L18 14H6L12 8Z" fill="currentColor"/>
        </svg>
      </button>

      <style jsx global>{`
        /* Disable text selection */
        * {
          -webkit-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        html, body {
          background-color: black;
        }

        .nav-button {
          border: 1px solid #4D4D4D;
          border-radius: 10px;
          background-color: rgba(255, 255, 255, 0.12);
          transition: all 0.3s ease-in-out;
        }
        
        .nav-button:hover {
          border-color: rgba(255, 255, 255, 0.39);
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
        }
        
        .hover-letter {
          color: #FFFFFF;
          transition: color 0.5s ease-in-out;
        }
        
        .hover-letter:hover {
          color: #EAD5FF;
        }

        /* Darker Scrollbar styles */
        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: #000000;
        }

        ::-webkit-scrollbar-thumb {
          background: #1A1A1A;
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #2A2A2A;
        }

        /* Add smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }
      `}</style>

      <style jsx>{`
        .timeline-path {
          animation: drawPath 2s ease-out forwards;
          stroke-dasharray: 2000;
          stroke-dashoffset: 2000;
        }

        @keyframes drawPath {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </>
  );
}