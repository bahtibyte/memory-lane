'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { StatsContainer } from '../shared/StatsContainer';
import { ImageOverlay } from '../shared/photos/ImageOverlay';
import { PhotoEntry } from '../shared/photos/PhotoEntry';
import { useMemoryLane } from '@/core/context/memory-provider';
import { useAuth } from '@/core/context/auth-provider';
import LoadingScreen from '@/app/shared/Loading';
import { HomeIcon } from '../shared/icons/HomeIcon';
import PasswordProtected from '../shared/memory/PasswordProtected';
import UploadFirstPhoto from '../shared/memory/UploadFirstPhoto';
import PageNotFound from '../shared/memory/PageNotFound';
import { PhotoIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

function getYearsSpan(dates: string[]) {
  if (dates.length === 0) return "0";
  try {
    // Find oldest date
    const timestamps = dates.map(date => new Date(date).getTime());
    const oldestDate = new Date(Math.min(...timestamps));
    const today = new Date();

    // Check if date is valid
    if (isNaN(oldestDate.getTime())) return "0";

    // Calculate difference in years from oldest date to today
    const diffYears = (today.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    const fixedYears = Math.max(0, diffYears).toFixed(1);
    return fixedYears == "1.0" ? "1" : fixedYears;
  } catch (error) {
    console.error('Error calculating years span:', error);
    return "0";
  }
}

export default function Timeline() {
  const memory_id = useParams()['memory-id'] as string;
  const {
    memoryLane,
    loading,
    failedToLoad,
    fetchData,
    unauthorized
  } = useMemoryLane();
  
  const { isAuthenticated } = useAuth();

  const [scrollProgress, setScrollProgress] = useState(0);
  const [imageDimensions, setImageDimensions] = useState<{ [key: string]: { width: number, height: number } }>({});
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => { fetchData(memory_id); }, [memory_id, fetchData]);

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

  // Add effect to handle body scroll locking
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to ensure scroll is restored when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  if (unauthorized) {
    return <PasswordProtected memory_id={memory_id} />
  }

  if (failedToLoad) {
    return <PageNotFound />
  }

  if (loading || !memoryLane) {
    return <LoadingScreen />
  }

  if (memoryLane.photo_entries.length === 0) {
    return <UploadFirstPhoto
      memoryLane={memoryLane}
      isAuthenticated={isAuthenticated}
      memory_id={memory_id}
    />
  }

  // Update the data source for sorted entries and stats
  const sortedEntries = [...memoryLane.photo_entries].sort((a, b) =>
    new Date(b.photo_date).getTime() - new Date(a.photo_date).getTime()
  );
  const yearsSpan = getYearsSpan(sortedEntries.map(entry => entry.photo_date));
  const photoCount = sortedEntries.length;
  const friendsCount = memoryLane.friends.length;

  // Function to get year from date string
  const getYear = (dateString: string) => new Date(dateString).getFullYear();

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#0E0E0E]">
      {selectedImage && <ImageOverlay image={selectedImage} onClose={() => setSelectedImage(null)} />}

      <div className="max-w-[1000px] mx-auto">
        {/* Header with Group Name and Action Buttons */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <Link
              href={isAuthenticated ? "/my-groups" : "/"}
              className="px-2 md:px-3 py-2 border border-purple-300 text-purple-300 rounded hover:bg-purple-300 hover:text-black transition-colors flex items-center gap-2"
            >
              <HomeIcon className="w-4 h-4 md:w-5 md:h-5" />
              <span>Home</span>
            </Link>
          </div>
          <div className="flex justify-end gap-2 md:gap-4 flex-shrink-0">
            {isAuthenticated ? (
              <>
                <Link
                  href={`/${memory_id}/upload-photo`}
                  className="px-2 md:px-4 py-2 bg-purple-300 text-black rounded hover:bg-purple-400 transition-colors text-sm md:text-base whitespace-nowrap flex items-center gap-2"
                >
                  <PhotoIcon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="sm:hidden">Upload</span>
                  <span className="hidden sm:inline">Upload Photo</span>
                </Link>
                <Link
                  href={`/${memory_id}/edit-group`}
                  className="px-2 md:px-4 py-2 border border-purple-300 text-purple-300 rounded hover:bg-purple-300 hover:text-black transition-colors text-sm md:text-base whitespace-nowrap flex items-center gap-2"
                >
                  <PencilSquareIcon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="sm:hidden">Edit</span>
                  <span className="hidden sm:inline">Edit Group</span>
                </Link>
              </>
            ) : (
              <>
                <span className="px-2 md:px-4 py-2 bg-gray-500 text-gray-300 rounded cursor-not-allowed text-sm md:text-base relative group whitespace-nowrap flex items-center gap-2">
                  <PhotoIcon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="sm:hidden">Upload</span>
                  <span className="hidden sm:inline">Upload Photo</span>
                  <span className="invisible group-hover:visible absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-sm rounded whitespace-nowrap">
                    Not signed in or admin of this group
                  </span>
                </span>
                <span className="px-2 md:px-4 py-2 border border-gray-500 text-gray-500 rounded cursor-not-allowed text-sm md:text-base relative group whitespace-nowrap flex items-center gap-2">
                  <PencilSquareIcon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="sm:hidden">Edit</span>
                  <span className="hidden sm:inline">Edit Group</span>
                  <span className="invisible group-hover:visible absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-sm rounded whitespace-nowrap">
                    Not signed in or admin of this group
                  </span>
                </span>
              </>
            )}
          </div>
        </div>

        <StatsContainer 
          photoCount={photoCount} 
          friendsCount={friendsCount} 
          yearsSpan={yearsSpan} 
          groupName={memoryLane.group_data.group_name}
        />

        {/* Timeline */}
        <div className="space-y-4 md:space-y-8 relative">
          {/* Today text */}
          <div className="absolute left-[80px] sm:left-[140px] md:left-[200px] -top-12 text-[12px] sm:text-[14px] md:text-[16px] text-purple-300 -translate-x-1/2">Today</div>

          {/* Background line */}
          <div className="absolute left-[80px] sm:left-[140px] md:left-[200px] w-[2px] -top-10 h-[calc(100%)] bg-[#242424]"></div>

          {/* Progress line */}
          <div
            className="absolute left-[80px] sm:left-[140px] md:left-[200px] w-[2px] bg-purple-300"
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

            return (
              <PhotoEntry
                key={index}
                entry={entry}
                index={index}
                totalEntries={sortedEntries.length}
                scrollProgress={scrollProgress}
                currentYear={currentYear}
                prevYear={prevYear}
                nextYear={nextYear}
                imageDimensions={imageDimensions}
                onImageLoad={handleImageLoad}
                onImageClick={(url: string, title: string) => setSelectedImage({ url, title })}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}