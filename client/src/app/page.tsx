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
  const [scrollProgress, setScrollProgress] = useState(50);
  const yearsSpan = getYearsSpan(DUMMY_DATA.photo_entries.map(entry => entry.photo_date));

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = 315;
      
      // Calculate progress based on threshold (0 to 100)
      const progress = (scrollY / threshold) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
      
      // Force a re-render to update circle colors
      forceUpdate({});
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add forceUpdate function
  const [, forceUpdate] = useState({});

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[rgb(30,30,30)]">
      <div className="max-w-[1000px] mx-auto">
        {/* Group Name Header */}
        <h1 className="text-[32px] md:text-[50px] font-bold mb-8">{DUMMY_DATA.group}</h1>

        {/* Stats Container */}
        <div className="pb-16">
          <div className="flex">
            <div className="text-left">
              <p className="text-[24px] md:text-[36px] font-bold text-[#CCC7F8]">{DUMMY_DATA.photos_count}</p>
              <p className="text-white text-[16px] md:text-[24px]">Photos</p>
            </div>
            <div className="text-left ml-20">
              <p className="text-[24px] md:text-[36px] font-bold text-[#CCC7F8]">{DUMMY_DATA.friends_count}</p>
              <p className="text-white text-[16px] md:text-[24px]">Friends</p>
            </div>
            <div className="text-left ml-20">
              <p className="text-[24px] md:text-[36px] font-bold text-[#CCC7F8]">{yearsSpan}</p>
              <p className="text-white text-[16px] md:text-[24px]">Years</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4 md:space-y-8 relative">
          {/* Today text */}
          <div className="absolute left-24 md:left-48 ml-4 -top-12 text-[14px] md:text-[16px] text-[#CCC7F8] -translate-x-1/2">Today</div>
          
          {/* Background line */}
          <div className="absolute left-24 md:left-48 ml-4 w-[2px] -top-10 h-[calc(100%)] bg-white opacity-20"></div>

          {/* Progress line */}
          <div 
            className="fixed left-24 md:left-48 w-[2px] bg-[#CCC7F8]"
            style={{
              bottom: '50vh',
              height: '50vh',
              marginLeft: '147px',
              opacity: 0.8,
              clipPath: `inset(${100 - scrollProgress}% 0 0 0)`
            }}
          ></div>
          
          {DUMMY_DATA.photo_entries.map((entry, index) => (
            <div key={index} className="flex gap-8 items-center min-h-[200px] pb-12 relative" id={`entry-${index}`}>
              {/* Circle on timeline */}
              <div 
                ref={(el) => {
                  if (el) {
                    const rect = el.getBoundingClientRect();
                    const viewportCenter = window.innerHeight / 2;
                    el.style.backgroundColor = 
                      rect.top + rect.height/2 <= viewportCenter 
                        ? '#CCC7F8' 
                        : 'white';
                  }
                }}
                className="absolute left-[202px] top-[calc(50%-28px)] -translate-y-1/2 w-3 h-3 rounded-full"
              ></div>
              
              {/* Date and Caption */}
              <div className="w-48 text-right flex flex-col justify-center">
                <p className="text-[14px] md:text-[16px] font-semibold text-[#CCC7F8]">{formatDate(entry.photo_date)}</p>
                <p className="text-white mt-2 text-[18px] md:text-[24px]">{entry.photo_title}</p>
              </div>

              {/* Photo and Caption Container */}
              <div className="flex-1">
                {/* Photo */}
                <div className="relative aspect-video">
                  <Image
                    src={entry.photo_url}
                    alt={entry.photo_title}
                    fill
                    className="rounded-md shadow-md object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                {/* Photo Caption */}
                <p className="text-white mt-2 text-[14px] md:text-[16px]">{entry.photo_caption}</p>
                <p className="text-gray-400 text-[12px] md:text-sm mt-1">{getDaysAgo(entry.photo_date)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}