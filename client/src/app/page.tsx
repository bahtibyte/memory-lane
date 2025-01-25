'use client';
import Image from 'next/image';
import { DUMMY_DATA } from './data';
import { useEffect, useState } from 'react';

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function getDaysAgo(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} days ago`;
}

function getYearsSpan(dates: string[]) {
  if (dates.length === 0) return "0";
  const oldestDate = new Date(Math.min(...dates.map(date => new Date(date).getTime())));
  const today = new Date();
  const diffYears = (today.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  return diffYears.toFixed(1);
}

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [imageDimensions, setImageDimensions] = useState<{ [key: string]: { width: number, height: number } }>({});
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);
  const sortedEntries = [...DUMMY_DATA.photo_entries].sort((a, b) => 
    new Date(b.photo_date).getTime() - new Date(a.photo_date).getTime()
  );
  const yearsSpan = getYearsSpan(sortedEntries.map(entry => entry.photo_date));
  const photoCount = sortedEntries.length;
  const friendsCount = Object.keys(DUMMY_DATA.friends).length;

  // Function to get year from date string
  const getYear = (dateString: string) => new Date(dateString).getFullYear();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      const progress = (scrollY / scrollableHeight) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add this function to handle image load
  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>, photoUrl: string) => {
    const img = event.target as HTMLImageElement;
    setImageDimensions(prev => ({
      ...prev,
      [photoUrl]: {
        width: img.naturalWidth,
        height: img.naturalHeight
      }
    }));
  };

  // Add escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[rgb(30,30,30)]">
      {/* Add the fullscreen overlay */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative w-full h-full p-4 flex items-center justify-center">
            <Image
              src={selectedImage.url}
              alt={selectedImage.title}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
              width={1920}
              height={1080}
            />
          </div>
        </div>
      )}

      <div className="max-w-[1000px] mx-auto">
        {/* Group Name Header */}
        <h1 className="text-[32px] md:text-[50px] font-bold mb-8">{DUMMY_DATA.group}</h1>

        {/* Stats Container */}
        <div className="pb-16">
          <div className="flex flex-wrap gap-8">
            <div className="text-left">
              <p className="text-[20px] sm:text-[24px] md:text-[36px] font-bold text-[#CCC7F8]">{photoCount}</p>
              <p className="text-white text-[14px] sm:text-[16px] md:text-[24px]">Photos</p>
            </div>
            <div className="text-left">
              <p className="text-[20px] sm:text-[24px] md:text-[36px] font-bold text-[#CCC7F8]">{friendsCount}</p>
              <p className="text-white text-[14px] sm:text-[16px] md:text-[24px]">Friends</p>
            </div>
            <div className="text-left">
              <p className="text-[20px] sm:text-[24px] md:text-[36px] font-bold text-[#CCC7F8]">{yearsSpan}</p>
              <p className="text-white text-[14px] sm:text-[16px] md:text-[24px]">Years</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4 md:space-y-8 relative">
          {/* Today text */}
          <div className="absolute left-[80px] sm:left-[140px] md:left-[200px] -top-12 text-[12px] sm:text-[14px] md:text-[16px] text-[#CCC7F8] -translate-x-1/2">Today</div>
          
          {/* Background line */}
          <div className="absolute left-[80px] sm:left-[140px] md:left-[200px] w-[2px] -top-10 h-[calc(100%)] bg-white opacity-20"></div>

          {/* Progress line */}
          <div 
            className="absolute left-[80px] sm:left-[140px] md:left-[200px] w-[2px] bg-[#CCC7F8]"
            style={{
              top: '-40px',
              height: '100%',
              opacity: 0.8,
              clipPath: `inset(0 0 ${100 - scrollProgress}% 0)`
            }}
          ></div>
          
          {sortedEntries.map((entry, index) => {
            const currentYear = getYear(entry.photo_date);
            const prevYear = index > 0 ? getYear(sortedEntries[index - 1].photo_date) : currentYear;
            const nextYear = index < sortedEntries.length - 1 ? getYear(sortedEntries[index + 1].photo_date) : currentYear;
            
            const isPortrait = imageDimensions[entry.photo_url]?.height > imageDimensions[entry.photo_url]?.width;
            
            return (
              <div key={index}>
                {currentYear !== prevYear && (
                  <div className="flex items-center gap-4 sm:gap-8 mb-8">
                    <div className="w-[80px] sm:w-[140px] md:w-[200px] text-right pr-4 sm:pr-6">
                      <p className="text-[18px] sm:text-[20px] md:text-[24px] font-bold text-[#CCC7F8]">{currentYear}</p>
                    </div>
                    <div className="flex-1">
                      <div className="border-t border-[#CCC7F8] opacity-30"></div>
                    </div>
                  </div>
                )}
                <div className={`flex gap-4 sm:gap-8 items-start min-h-[200px] ${currentYear !== nextYear ? 'pb-0' : 'pb-6 sm:pb-8 md:pb-12'}`} id={`entry-${index}`}>
                  {/* Main content container */}
                  <div className="flex-1">
                    {/* Photo entry group - contains date, title, and image */}
                    <div className="flex gap-4 sm:gap-8 items-center relative">
                      <div className="w-[80px] sm:w-[140px] md:w-[200px] text-right pr-4 sm:pr-6">
                        <p className="text-[12px] sm:text-[14px] md:text-[16px] font-semibold text-[#CCC7F8]">{formatDate(entry.photo_date)}</p>
                        <p className="text-white mt-2 text-[14px] sm:text-[18px] md:text-[24px]">{entry.photo_title}</p>
                      </div>

                      {/* Timeline dot */}
                      <div 
                        className={`absolute left-[80px] sm:left-[140px] md:left-[200px] top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 sm:w-3 h-2 sm:h-3 rounded-full transition-colors duration-300
                          ${scrollProgress > (index / sortedEntries.length) * 100 ? 'bg-[#CCC7F8]' : 'bg-white'}`}
                      ></div>

                      <div className="flex-1">
                        <div className="relative w-full">
                          {/* Replace the fixed height div with conditional styling */}
                          <div className={`relative ${isPortrait ? 'h-[50vh]' : ''} bg-black`}>
                            {/* Only show blur background for portrait images */}
                            {isPortrait && (
                              <div className="absolute inset-0 overflow-hidden">
                                <Image
                                  src={entry.photo_url}
                                  alt=""
                                  fill
                                  className="opacity-30 blur-xl scale-110 object-cover"
                                  sizes="100vw"
                                  priority={false}
                                  quality={10}
                                />
                              </div>
                            )}
                            {/* Main image */}
                            <div 
                              className={`relative ${isPortrait ? 'h-full' : ''} flex items-center justify-center cursor-pointer`}
                              onClick={() => setSelectedImage({ url: entry.photo_url, title: entry.photo_title })}
                            >
                              <Image
                                src={entry.photo_url}
                                alt={entry.photo_title}
                                fill={isPortrait}
                                width={!isPortrait ? 1000 : undefined}
                                height={!isPortrait ? 600 : undefined}
                                className="rounded-md shadow-md object-contain hover:opacity-90 transition-opacity"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                onLoad={(e) => handleImageLoad(e, entry.photo_url)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Caption and date info */}
                    <div className="mt-2 ml-[calc(80px+16px)] sm:ml-[calc(140px+32px)] md:ml-[calc(200px+32px)]">
                      <p className="text-white text-[12px] sm:text-[13px] md:text-[16px]">{entry.photo_caption}</p>
                      <p className="text-gray-400 text-[10px] sm:text-[11px] md:text-sm mt-1">{getDaysAgo(entry.photo_date)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}