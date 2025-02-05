"use client";

import { useState } from 'react';
import Link from 'next/link';

const contributors = [
  {
    name: "Bakhti Rasulov",
    title: "Ex Google Engineer",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    funFacts: "Secretly wishes he was a professional chess player. Once debugged code in his sleep. Has a collection of rubber ducks for rubber duck debugging.",
    image: "https://cdn.discordapp.com/attachments/1012109024226975764/1336546425403605053/image.png?ex=67a4335b&is=67a2e1db&hm=e509c94e877541b62d858d95b2974da1459534565586fd2f7ef524143ad0ba5d&",
    linkedin: "https://www.linkedin.com/in/bakhti-rasulov/",
    github: "https://github.com/bahtibyte",
    resume: "https://www.google.com/search?q=cat&oq=cat&gs_lcrp=EgZjaHJvbWUqBwgAEAAYjwIyBwgAEAAYjwIyCggBEC4YsQMYgAQyDAgCECMYJxiABBiKBTITCAMQLhiDARjHARixAxjRAxiABDIHCAQQABiABDIQCAUQLhiDARixAxiABBiKBTIGCAYQRRg8MgYIBxBFGDzSAQgxMDc2ajBqN6gCALACAA&sourceid=chrome&ie=UTF-8#vhid=oc0yOiQ9sK4GZM&vssid=l",
  },
  {
    name: "Sigalita Yakubova",
    title: "Goldman Sachs Engineer",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    funFacts: "Can recite the entire binary search algorithm backwards. Has named all her plants after sorting algorithms. Dreams in JavaScript.",
    image: "https://cdn.discordapp.com/attachments/1274116404282654732/1336510440221446194/IMG_0595.jpg?ex=67a411d8&is=67a2c058&hm=1687246c1ea118269f517378b1301643eed2df1401064eef26d6ffb82b904add&",
    linkedin: "https://www.linkedin.com/in/sigalita-yakubova-11875a223/",
    github: "https://github.com/Sigalitay",
  },
  {
    name: "Afshana Falza",
    title: "Moving in silence",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    funFacts: "Types faster than she speaks. Has a secret collection of programming memes. Once fixed a bug by staring at it intensely.",
    image: "https://cdn.discordapp.com/attachments/1012109024226975764/1336546308093120512/image.png?ex=67a4333f&is=67a2e1bf&hm=72c189e0f234f4e6daf5474c506c2c57776d58cd1f222d3cca9b13d496df3070&",
    linkedin: "https://www.linkedin.com/in/afshanafalza/",
    github: "https://github.com/afshanafalza",
  },
];

export default function ContributorsPage() {
  const [lightMode, setLightMode] = useState<{[key: number]: boolean}>({});

  const toggleLight = (index: number) => {
    setLightMode(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <main className="min-h-screen bg-black px-2 xs:px-4 sm:px-8 py-12 sm:py-20">
      {/* Navigation Buttons */}
      <div className="absolute sm:fixed top-4 right-2 xs:right-4 flex gap-1 xs:gap-2 sm:gap-4 z-10">
        <Link
          href="/"
          className="nav-button px-4 py-2 text-sm text-white flex items-center gap-2"
        >
          HOME
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5.69L17 10.19V18H15V12H9V18H7V10.19L12 5.69ZM12 3L2 12H5V20H11V14H13V20H19V12H22L12 3Z" fill="currentColor"/>
          </svg>
        </Link>
        <Link
          href="https://github.com/bahtibyte/memory-lane"
          target="_blank"
          className="nav-button px-4 py-2 text-sm text-white flex items-center gap-2"
        >
          GITHUB
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.477 2 2 6.477 2 12C2 16.991 5.571 21.128 10.285 22V18.857C9.705 19.002 9.195 19.002 8.657 18.76C7.915 18.42 7.326 17.577 6.93 16.851C6.715 16.488 6.198 16.086 5.786 16.116L5.734 15.17C6.731 15.083 7.565 15.722 8.058 16.541C8.276 16.907 8.524 17.164 8.858 17.298C9.181 17.427 9.519 17.387 9.934 17.265C9.996 16.623 10.267 16.223 10.497 15.9V15.9C7.726 15.437 6.739 13.847 6.366 12.647C5.89 11.045 6.31 9.036 7.354 7.947C7.378 7.922 7.396 7.891 7.401 7.857C7.406 7.823 7.398 7.789 7.379 7.76C6.947 6.637 7.06 5.17 7.355 4.527C8.193 4.648 9.218 5.183 10.061 5.811C10.135 5.868 10.23 5.885 10.319 5.857C11.413 5.544 12.552 5.392 13.649 5.392C14.749 5.392 15.892 5.544 16.988 5.858C17.077 5.886 17.172 5.869 17.246 5.812C18.088 5.184 19.111 4.649 19.951 4.528C20.246 5.171 20.359 6.636 19.929 7.759C19.91 7.788 19.902 7.822 19.907 7.856C19.912 7.89 19.929 7.921 19.954 7.946C21.012 9.049 21.419 11.078 20.941 12.676C20.566 13.862 19.574 15.441 16.815 15.899V15.899C17.141 16.349 17.5 17.099 17.5 18.099V22C22.215 21.129 25.786 16.992 25.786 12C25.786 6.477 21.309 2 15.786 2H12Z" fill="currentColor"/>
          </svg>
        </Link>
      </div>

      <div className="w-full max-w-7xl mx-auto flex flex-col items-center px-2 xs:px-4">
        <div className="w-full lg:w-[60%] md:w-[70%] sm:w-[80%]">
          <h1 className="text-3xl xs:text-4xl sm:text-6xl md:text-7xl font-bold text-white mb-4 leading-tight">
            <div className="hover-text">
              <span className="hover-letter">T</span>
              <span className="hover-letter">h</span>
              <span className="hover-letter">e</span>
            </div>
            <div className="hover-text">
              <span className="hover-letter">C</span>
              <span className="hover-letter">o</span>
              <span className="hover-letter">n</span>
              <span className="hover-letter">t</span>
              <span className="hover-letter">r</span>
              <span className="hover-letter">i</span>
              <span className="hover-letter">b</span>
              <span className="hover-letter">u</span>
              <span className="hover-letter">t</span>
              <span className="hover-letter">o</span>
              <span className="hover-letter">r</span>
              <span className="hover-letter">s</span>
            </div>
          </h1>
          
          <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-[#DCDCDC] max-w-2xl mb-6 sm:mb-8 md:mb-12">
            Meet the team behind Memory Lane.
          </p>
        </div>

        <div className="space-y-4 xs:space-y-6 sm:space-y-8 flex flex-col items-center w-full">
          {contributors.map((contributor, index) => (
            <div 
              key={index} 
              className={`rounded-lg p-4 xs:p-6 sm:p-8 md:p-12 flex flex-col sm:flex-row items-center gap-3 xs:gap-4 sm:gap-6 md:gap-8 border w-full lg:w-[60%] md:w-[70%] sm:w-[80%] transition-all duration-500 ease-in-out ${
                lightMode[index] 
                  ? 'bg-[#111111] border-[#DFC6F7]/40 shadow-[0_0_30px_rgba(223,198,247,0.15)] shadow-[#DFC6F7]/20' 
                  : 'bg-[#111111] border-[#2D2D2D]'
              }`}
            >
              <img 
                src={contributor.image} 
                alt={contributor.name}
                className="w-24 h-24 xs:w-32 xs:h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full object-cover transition-all duration-500 ease-in-out"
              />
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-3 xs:gap-4">
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold text-white transition-colors duration-500 ease-in-out">
                      {contributor.name}
                    </h2>
                    <p className="text-xs xs:text-sm sm:text-base text-gray-400 transition-colors duration-500 ease-in-out">
                      {contributor.title}
                    </p>
                  </div>
                  <div className="flex gap-3 xs:gap-4 items-center">
                    <button
                      onClick={() => toggleLight(index)}
                      className={`transition-all duration-500 ease-in-out hover:scale-105 ${
                        lightMode[index] 
                          ? 'text-[#DFC6F7] hover:text-[#D4B3F3]' 
                          : 'text-gray-400 hover:text-[#DFC6F7]/50'
                      }`}
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0-5c.55 0 1 .45 1 1v2c0 .55-.45 1-1 1s-1-.45-1-1v-2c0-.55.45-1 1-1zm0 17c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1zm9-9h-2c-.55 0-1-.45-1-1s.45-1 1-1h2c.55 0 1 .45 1 1s-.45 1-1 1zM6 12c0 .55-.45 1-1 1H3c-.55 0-1-.45-1-1s.45-1 1-1h2c.55 0 1 .45 1 1zm13.71 5.29c-.39.39-1.02.39-1.41 0l-1.41-1.41c-.39-.39-.39-1.02 0-1.41s1.02-.39 1.41 0l1.41 1.41c.39.38.39 1.01 0 1.41zm-11.31 0c-.39.39-1.02.39-1.41 0-.39-.39-.39-1.02 0-1.41l1.41-1.41c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41l-1.41 1.41zm9.9-11.31c-.39.39-1.02.39-1.41 0-.39-.39-.39-1.02 0-1.41l1.41-1.41c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41l-1.41 1.41zm-11.31 0L5.58 4.57c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0l1.41 1.41c.39.39.39 1.02 0 1.41-.39.38-1.02.38-1.41 0z"/>
                      </svg>
                    </button>
                    <a 
                      href={contributor.linkedin} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors duration-500 ease-in-out"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                    <a 
                      href={contributor.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors duration-500 ease-in-out"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                    {contributor.resume && (
                      <a 
                        href={contributor.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6z M9 13h6v2H9v-2zm0 3h6v2H9v-2z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
                <p className="mt-3 xs:mt-4 text-sm xs:text-base sm:text-lg text-gray-300 transition-all duration-500 ease-in-out text-center sm:text-left">
                  {lightMode[index] ? contributor.funFacts : contributor.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        /* Remove the media query that was changing button sizes */
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
    </main>
  );
}