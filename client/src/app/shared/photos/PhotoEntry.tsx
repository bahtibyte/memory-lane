import Image from 'next/image';
import React from 'react';

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getDaysAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  
  // If more than 365 days, show years and months
  if (diffDays > 365) {
    const years = Math.floor(diffDays / 365);
    const remainingDays = diffDays % 365;
    const months = Math.floor(remainingDays / 30);
    
    if (months === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }
    return `${years} ${years === 1 ? 'year' : 'years'}, ${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  
  return `${diffDays} days ago`;
}

export function getYear(dateString: string): number {
  return new Date(dateString).getFullYear();
}

interface PhotoEntry {
  photo_date: string;
  photo_title: string;
  photo_url: string;
  photo_caption: string;
}

interface PhotoEntryProps {
  entry: PhotoEntry;
  index: number;
  totalEntries: number;
  scrollProgress: number;
  currentYear: number;
  prevYear: number;
  nextYear: number;
  imageDimensions: { [key: string]: { width: number; height: number } };
  onImageLoad: (event: React.SyntheticEvent<HTMLImageElement>, photoUrl: string) => void;
  onImageClick: (url: string, title: string) => void;
}

export function PhotoEntry({
  entry,
  index,
  totalEntries,
  scrollProgress,
  currentYear,
  prevYear,
  nextYear,
  imageDimensions,
  onImageLoad,
  onImageClick,
}: PhotoEntryProps) {
  const dimensions = imageDimensions[entry.photo_url];
  const isPortrait = dimensions?.height > dimensions?.width;
  const isSquare = dimensions?.height === dimensions?.width;
  const [imageLoaded, setImageLoaded] = React.useState(false);
  
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageLoaded(true);
    onImageLoad(e, entry.photo_url);
  };

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
        <div className="flex-1">
          <div className="flex gap-4 sm:gap-8 items-center relative">
            <div className="w-[80px] sm:w-[140px] md:w-[200px] text-right pr-4 sm:pr-6">
              <p className="text-[12px] sm:text-[14px] md:text-[16px] font-semibold text-[#CCC7F8]">{formatDate(entry.photo_date)}</p>
              <p className="text-white mt-2 text-[14px] sm:text-[18px] md:text-[24px]">{entry.photo_title}</p>
            </div>

            <div
              className={`absolute left-[80px] sm:left-[140px] md:left-[200px] top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 sm:w-3 h-2 sm:h-3 rounded-full transition-colors duration-300
                ${scrollProgress > (index / totalEntries) * 100 ? 'bg-[#CCC7F8]' : 'bg-white'}`}
            ></div>

            <div className="flex-1">
              <div className="relative w-full">
                <div className={`relative ${isPortrait ? 'h-[50vh]' : 'max-h-[600px]'} bg-black`}>
                  {(isPortrait || isSquare) && (
                    <div className="absolute inset-0 overflow-hidden">
                      <Image
                        src={entry.photo_url}
                        alt=""
                        fill
                        className="opacity-30 blur-xl scale-110 object-cover"
                        sizes="100vw"
                        priority
                        quality={10}
                      />
                    </div>
                  )}
                  <div
                    className={`relative ${isPortrait || isSquare ? 'h-[50vh]' : ''} flex items-center justify-center cursor-pointer max-w-[1000px] mx-auto`}
                    onClick={() => onImageClick(entry.photo_url, entry.photo_title)}
                  >
                    <Image
                      src={entry.photo_url}
                      alt={entry.photo_title}
                      fill={isPortrait || isSquare}
                      priority
                      width={!isPortrait && !isSquare ? 1000 : undefined}
                      height={!isPortrait && !isSquare ? 600 : undefined}
                      className={`rounded-md shadow-md object-contain hover:opacity-90 transition-opacity ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 1000px"
                      quality={85}
                      onLoad={handleImageLoad}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-2 ml-[calc(80px+16px)] sm:ml-[calc(140px+32px)] md:ml-[calc(200px+32px)]">
            <p className="text-white text-[12px] sm:text-[13px] md:text-[16px]">{entry.photo_caption}</p>
            <p className="text-gray-400 text-[10px] sm:text-[11px] md:text-sm mt-1">{getDaysAgo(entry.photo_date)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}