'use client';
import { DUMMY_DATA } from '../../data';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { StatsContainer } from '../../components/StatsContainer';
import { ImageOverlay } from '../../components/ImageOverlay';
import { PhotoEntry } from '../../components/PhotoEntry';


function getYearsSpan(dates: string[]) {
  if (dates.length === 0) return "0";
  try {
    // Convert date strings to iOS-friendly format (replace hyphens with slashes)
    const oldestDate = new Date(Math.min(...dates.map(date =>
      new Date(date.replace(/-/g, '/')).getTime()
    )));
    const today = new Date();

    // Check if oldestDate is valid
    if (isNaN(oldestDate.getTime())) return "0";

    const diffYears = (today.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return Math.max(0, diffYears).toFixed(1);
  } catch (error) {
    console.error('Error calculating years span:', error);
    return "0";
  }
}

export default function Timeline() {
  const params = useParams();
  const [timelineData, setTimelineData] = useState(DUMMY_DATA);
  const [loading, setLoading] = useState(true);
  const [failedToLoad, setFailedToLoad] = useState(false);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [imageDimensions, setImageDimensions] = useState<{ [key: string]: { width: number, height: number } }>({});
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        // Use DUMMY_DATA for 'test' slug
        if (params.slug?.[0] === 'test') {
          setTimelineData(DUMMY_DATA);
        } else {
          console.log('Fetching timeline data for group:', params.slug?.[0]);
          const response = await fetch(`http://localhost:3005/api/get-timeline?group_id=${params.slug?.[0]}`, {
            method: 'GET'
          });
          if (!response.ok) {
            console.log('Failed to fetch timeline data:', response);
            setFailedToLoad(true);
          }
          const data = await response.json();
          setTimelineData(data);
        }
      } catch (error) {
        console.error('Error fetching timeline data:', error);
        setFailedToLoad(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTimelineData();
  }, [params.slug]);


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
  
  if (!params.slug || params.slug.length > 1 || failedToLoad) {
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
  const sortedEntries = [...timelineData.photo_entries].sort((a, b) =>
    new Date(b.photo_date).getTime() - new Date(a.photo_date).getTime()
  );
  const yearsSpan = getYearsSpan(sortedEntries.map(entry => entry.photo_date));
  const photoCount = sortedEntries.length;
  const friendsCount = Object.keys(timelineData.friends).length;

  // Function to get year from date string
  const getYear = (dateString: string) => new Date(dateString).getFullYear();

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[rgb(30,30,30)]">
      {selectedImage && <ImageOverlay image={selectedImage} onClose={() => setSelectedImage(null)} />}

      <div className="max-w-[1000px] mx-auto">
        {/* Group Name Header */}
        <h1 className="text-[32px] md:text-[50px] font-bold mb-8">{timelineData.group_name}</h1>

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