'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { StatsContainer } from '../components/StatsContainer';
import { ImageOverlay } from '../components/photos/ImageOverlay';
import { PhotoEntry } from '../components/photos/PhotoEntry';
import { useTimeline } from '@/app/context/timeline-context';


function getYearsSpan(dates: string[]) {
  if (dates.length === 0) return "0";
  try {
    // Find oldest and newest dates
    const timestamps = dates.map(date => new Date(date).getTime());
    const oldestDate = new Date(Math.min(...timestamps));
    const newestDate = new Date(Math.max(...timestamps));

    // Check if dates are valid
    if (isNaN(oldestDate.getTime()) || isNaN(newestDate.getTime())) return "0";

    // Calculate difference in years
    const diffYears = (newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
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
    fetchData
  } = useTimeline();

  const [scrollProgress, setScrollProgress] = useState(0);
  const [imageDimensions, setImageDimensions] = useState<{ [key: string]: { width: number, height: number } }>({});
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    fetchData(memory_id);
  }, [memory_id, fetchData]);

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

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-[rgb(30,30,30)] flex flex-col items-center justify-center">
        <h1 className="text-white text-2xl">Loading...</h1>
      </div>
    );
  }

  if (!memory_id || failedToLoad || !memoryLane) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-[rgb(30,30,30)] flex flex-col items-center justify-center">
        <h1 className="text-white text-2xl mb-4">Page not found</h1>
        <Link href="/" className="text-[#CCC7F8] hover:text-white underline">
          Go back to home page
        </Link>
      </div>
    );
  }

  // Update the data source for sorted entries and stats
  const sortedEntries = [...memoryLane.photo_entries].sort((a, b) =>
    new Date(b.photo_date).getTime() - new Date(a.photo_date).getTime()
  );
  const yearsSpan = getYearsSpan(sortedEntries.map(entry => entry.photo_date));
  const photoCount = sortedEntries.length;
  const friendsCount = 0;

  // Function to get year from date string
  const getYear = (dateString: string) => new Date(dateString).getFullYear();

  // Add early return for empty photo state
  if (photoCount === 0) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-[rgb(30,30,30)] flex flex-col items-center justify-center">
        <h1 className="text-white text-2xl mb-4">{memoryLane.group_data.group_name} timeline!</h1>
        <h1 className="text-white text-2xl mb-4">No group photos added yet</h1>
        <Link
          href={`/${memory_id}/upload-photo`}
          className="px-4 py-2 bg-[#CCC7F8] text-black rounded hover:bg-white transition-colors"
        >
          Upload first photo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[rgb(30,30,30)]">
      {selectedImage && <ImageOverlay image={selectedImage} onClose={() => setSelectedImage(null)} />}

      <div className="max-w-[1000px] mx-auto">
        {/* Header with Group Name and Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-[32px] md:text-[50px] font-bold">{memoryLane.group_data.group_name}</h1>
          <div className="flex gap-4">
            <Link
              href={`/${memory_id}/upload-photo`}
              className="px-4 py-2 bg-[#CCC7F8] text-black rounded hover:bg-white transition-colors text-sm md:text-base"
            >
              Upload Photo
            </Link>
            <Link
              href={`/${memory_id}/edit-group`}
              className="px-4 py-2 border border-[#CCC7F8] text-[#CCC7F8] rounded hover:bg-[#CCC7F8] hover:text-black transition-colors text-sm md:text-base"
            >
              Edit Group
            </Link>
          </div>
        </div>

        <StatsContainer photoCount={photoCount} friendsCount={friendsCount} yearsSpan={yearsSpan} />

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