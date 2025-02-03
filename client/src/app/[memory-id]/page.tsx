'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { StatsContainer } from '@/app/components/StatsContainer';
import { ImageOverlay } from '@/app/components/photos/ImageOverlay';
import { PhotoEntry } from '@/app/components/photos/PhotoEntry';
import { useMemoryLane } from '@/core/context/memory-provider';
import { useAuth } from '@/core/context/auth-provider';
import LoadingScreen from '@/app/components/Loading';
import { HomeIcon } from '@/app/components/icons/HomeIcon';

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
    fetchData,
    unauthorized
  } = useMemoryLane();

  const { isAuthenticated } = useAuth();

  const [scrollProgress, setScrollProgress] = useState(0);
  const [imageDimensions, setImageDimensions] = useState<{ [key: string]: { width: number, height: number } }>({});
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

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

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');

    try {
      console.log("attempting passwcode, ", passcode);


      await fetchData(memory_id, passcode);
      // if (response.ok) {
      //   // Refetch the memory lane data
      //   fetchData(memory_id);
      // } else {
      //   setPasscodeError('Invalid passcode');
      // }
    } catch (error) {
      console.log("error verifying passcode", error);
      setPasscodeError('Failed to verify passcode');
    }
  };

  if (!memory_id || failedToLoad) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-[rgb(30,30,30)] flex flex-col items-center justify-center">
        <h1 className="text-white text-2xl mb-4">Page not found</h1>
        <Link href="/" className="text-[#CCC7F8] hover:text-white underline">
          Go back to home page
        </Link>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-[rgb(30,30,30)] flex flex-col items-center justify-center">
        <h1 className="text-white text-2xl mb-6">This memory lane is passcode protected</h1>
        
        <div className="w-full max-w-sm">
          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-2 rounded bg-[rgb(45,45,45)] text-white border border-[#CCC7F8] focus:outline-none focus:ring-2 focus:ring-[#CCC7F8]"
              />
              {passcodeError && (
                <p className="mt-2 text-red-400 text-sm">{passcodeError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-[#CCC7F8] text-black rounded hover:bg-white transition-colors"
            >
              View memory lane
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <Link href="/" className="text-[#CCC7F8] hover:text-white text-sm">
              Return to home page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !memoryLane) { 
    return <LoadingScreen />
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
      <div className="min-h-screen bg-[#0E0E0E] p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-[#1A1A1A] border border-[#242424] rounded-lg p-8 text-center">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {memoryLane.group_data.group_name}
              </h1>
              <p className="text-gray-400 text-sm md:text-base">
                Start your timeline by uploading the first photo
              </p>
            </div>

            {/* Upload Button Section */}
            <div className="space-y-6">
              {isAuthenticated ? (
                <Link
                  href={`/${memory_id}/upload-photo`}
                  className="w-full inline-block bg-purple-300 text-black rounded-lg px-4 py-3 font-medium hover:bg-purple-400 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-300/20 transition-all duration-200"
                >
                  Upload First Photo
                </Link>
              ) : (
                <div className="relative">
                  <button
                    disabled
                    className="w-full px-4 py-3 bg-[#242424] text-gray-400 rounded-lg cursor-not-allowed transition-all duration-200"
                  >
                    Upload First Photo
                  </button>
                  <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-black text-white text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Not signed in
                  </span>
                </div>
              )}

              {/* Back Button */}
              <Link
                href={isAuthenticated ? "/my-groups" : "/"}
                className="w-full inline-block border border-[#242424] text-gray-300 rounded-lg px-4 py-3 hover:bg-[#242424] transition-all duration-200"
              >
                Back to {isAuthenticated ? "My Groups" : "Home"}
              </Link>
            </div>
          </div>
        </div>
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
            {isAuthenticated ? (
              <>
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
                <Link
                  href={isAuthenticated ? "/my-groups" : "/"}
                  className="px-3 py-2 border border-[#CCC7F8] text-[#CCC7F8] rounded hover:bg-[#CCC7F8] hover:text-black transition-colors"
                >
                  <HomeIcon className="w-5 h-5" />
                </Link>
              </>
            ) : (
              <>
                <span className="px-4 py-2 bg-gray-500 text-gray-300 rounded cursor-not-allowed text-sm md:text-base relative group">
                  Upload Photo
                  <span className="invisible group-hover:visible absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-sm rounded whitespace-nowrap">
                    Not signed in or part of this group
                  </span>
                </span>
                <span className="px-4 py-2 border border-gray-500 text-gray-500 rounded cursor-not-allowed text-sm md:text-base relative group">
                  Edit Group
                  <span className="invisible group-hover:visible absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-sm rounded whitespace-nowrap">
                    Not signed in or part of this group
                  </span>
                </span>
                <Link
                  href="/"
                  className="px-3 py-2 border border-[#CCC7F8] text-[#CCC7F8] rounded hover:bg-[#CCC7F8] hover:text-black transition-colors"
                >
                  <HomeIcon className="w-5 h-5" />
                </Link>
              </>
            )}
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