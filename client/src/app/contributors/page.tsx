"use client";

import { useState } from 'react';
import Image from 'next/image';
import ExternalNavigation from '../shared/landing/ExternalNavigation';

const contributors = [
  {
    name: "Bakhti Rasulov",
    title: "Lead Engineer",
    description: "Bahti spearheaded the project, taking charge of the backend development. They were responsible for setting up the server infrastructure, implementing secure authentication systems, and managing the database architecture. Their leadership and technical expertise were crucial in ensuring a stable and efficient backend foundation.",
    funFacts: "Bahti spent way too much time babying the backend, especially fighting with the authentication (which won most of the time). Micromanaged everything like their life depended on it, but hey—the server runs, the database exists, and that's what matters… right? Also overworked Sigi and Afshana, but that's a problem for future Bahti.",
    image: "https://memory-lane-photos.s3.us-east-2.amazonaws.com/contributors/bahti.png",
    linkedin: "https://www.linkedin.com/in/bakhti-rasulov/",
    github: "https://github.com/bahtibyte",
    resume: "https://www.google.com/search?q=cat&oq=cat&gs_lcrp=EgZjaHJvbWUqBwgAEAAYjwIyBwgAEAAYjwIyCggBEC4YsQMYgAQyDAgCECMYJxiABBiKBTITCAMQLhiDARjHARixAxjRAxiABDIHCAQQABiABDIQCAUQLhiDARixAxiABBiKBTIGCAYQRRg8MgYIBxBFGDzSAQgxMDc2ajBqN6gCALACAA&sourceid=chrome&ie=UTF-8#vhid=oc0yOiQ9sK4GZM&vssid=l",
  },
  {
    name: "Sigalita Yakubova",
    title: "Fullstack Engineer",
    description: "Sigi played a key role in developing the frontend, bringing the user interface to life. In addition to building out much of the frontend, Sigi also developed APIs for the backend and ensured seamless integration between the frontend and backend. Their work bridged the gap between design and functionality, creating a cohesive user experience.",
    funFacts: "Sigi had a natural gift for breaking things, particularly Bahti's fragile authentication. When not causing backend chaos, Sigi built out the frontend and accidentally stole the landing page from Afshana because they definitely missed that message. Oops. Dedicated her free time during her break to this project—questionable decision, but no regrets.",
    image: "https://memory-lane-photos.s3.us-east-2.amazonaws.com/contributors/sigi.png",
    linkedin: "https://www.linkedin.com/in/sigalita-yakubova-11875a223/",
    github: "https://github.com/Sigalitay",
  },
  {
    name: "Afshana Falza",
    title: "UI/UX Designer & Frontend Developer",
    description: "Afshana crafted the visual identity of the project using Figma, focusing on intuitive design and user engagement. She also implemented her designs on the Contributions and Landing pages, ensuring the aesthetic vision translated perfectly into the final product. Her eye for detail brought polish and professionalism to the site.",
    funFacts: "Afshana lived in Figma and famously wanted “a skeleton to put the meat on.” She definitely called dibs on the landing page (even though Sigi beat her to it) and avoided pushing Git changes like it was a sport. Still not on GitHub Contributors but insists she deserves a spot. She's not wrong. Somehow found time for this project despite having very little free time outside of work—truly a miracle.",
    image: "https://memory-lane-photos.s3.us-east-2.amazonaws.com/contributors/afshana.png",
    linkedin: "https://www.linkedin.com/in/afshanafalza/",
    github: "https://github.com/afshanafalza",
  },
  {
    name: "Dee Slawotsky",
    title: "Moving in silence",
    description: "Dee laid the groundwork for the project's design by providing the initial Figma skeleton that shaped the final look of the site. Their early contributions set the tone for the overall aesthetic, and while they had to step away after the first day, their foundational work was essential to the project's success.",
    funFacts: "Dee showed up on Day 1, dropped an awesome Figma skeleton, and then pulled a disappearing act worthy of an award. Even though they went MIA, that first-day magic gave the project the design foundation it needed. We're still grateful—and kinda wondering where they went",
    image: "https://memory-lane-photos.s3.us-east-2.amazonaws.com/contributors/dee.jpeg",
    linkedin: "https://www.linkedin.com/in/dees/",
    github: "https://github.com/davlsb",
    personalWebsite: "https://deedev.dev",
  },
];

export default function ContributorsPage() {
  const [lightMode, setLightMode] = useState<{ [key: number]: boolean }>({});

  const toggleLight = (index: number) => {
    setLightMode(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <main className="min-h-screen bg-black px-2 xs:px-4 sm:px-8 py-12 sm:py-20">
      {/* Navigation Buttons */}
      <ExternalNavigation links={{ home: true, contributors: false, github: true }} />

      <div className="w-full max-w-7xl mx-auto flex flex-col items-center px-2 xs:px-4">
        <div className="w-full lg:w-[80%] md:w-[80%] sm:w-[80%]">
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
              className={`rounded-lg p-4 xs:p-6 sm:p-8 md:p-12 flex flex-col sm:flex-row items-center gap-3 xs:gap-4 sm:gap-6 md:gap-8 border w-full lg:w-[80%] md:w-[80%] sm:w-[80%] transition-all duration-500 ease-in-out ${lightMode[index]
                ? 'bg-[#111111] border-[#DFC6F7]/40 shadow-[0_0_30px_rgba(223,198,247,0.15)] shadow-[#DFC6F7]/20'
                : 'bg-[#111111] border-[#2D2D2D]'
                }`}
            >
              <Image
                src={contributor.image}
                alt={contributor.name}
                width={160}
                height={160}
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
                      className={`transition-all duration-500 ease-in-out hover:scale-105 ${lightMode[index]
                        ? 'text-[#DFC6F7] hover:text-[#D4B3F3]'
                        : 'text-gray-400 hover:text-[#DFC6F7]/50'
                        }`}
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0-5c.55 0 1 .45 1 1v2c0 .55-.45 1-1 1s-1-.45-1-1v-2c0-.55.45-1 1-1zm0 17c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1zm9-9h-2c-.55 0-1-.45-1-1s.45-1 1-1h2c.55 0 1 .45 1 1s-.45 1-1 1zM6 12c0 .55-.45 1-1 1H3c-.55 0-1-.45-1-1s.45-1 1-1h2c.55 0 1 .45 1 1zm13.71 5.29c-.39.39-1.02.39-1.41 0l-1.41-1.41c-.39-.39-.39-1.02 0-1.41s1.02-.39 1.41 0l1.41 1.41c.39.38.39 1.01 0 1.41zm-11.31 0c-.39.39-1.02.39-1.41 0-.39-.39-.39-1.02 0-1.41l1.41-1.41c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41l-1.41 1.41zm9.9-11.31c-.39.39-1.02.39-1.41 0-.39-.39-.39-1.02 0-1.41l1.41-1.41c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41l-1.41 1.41zm-11.31 0L5.58 4.57c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0l1.41 1.41c.39.39.39 1.02 0 1.41-.39.38-1.02.38-1.41 0z" />
                      </svg>
                    </button>
                    <a
                      href={contributor.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors duration-500 ease-in-out"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                    <a
                      href={contributor.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors duration-500 ease-in-out"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
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
                          <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6z M9 13h6v2H9v-2zm0 3h6v2H9v-2z" />
                        </svg>
                      </a>
                    )}
                    {contributor.personalWebsite && (
                      <a
                        href={contributor.personalWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors duration-500 ease-in-out"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
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