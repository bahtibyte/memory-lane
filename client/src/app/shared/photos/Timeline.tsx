import { useEffect, useState } from "react";
import { PhotoEntry } from "./PhotoEntry";
import { Photo } from "@/core/utils/types";

interface TimelineProps {
  photos: Photo[];
  scrollProgress: number;
  setSelectedImage: (photo: Photo | null) => void;
}

export default function Timeline({ photos, scrollProgress, setSelectedImage }: TimelineProps) {

  const [photoDimensions, setPhotoDimensions] = useState<{ [key: string]: { width: number, height: number } }>({});

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

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>, photoUrl: string) => {
    const img = event.target as HTMLImageElement;
    setPhotoDimensions(prev => ({
      ...prev,
      [photoUrl]: {
        width: img.naturalWidth,
        height: img.naturalHeight
      }
    }));
  };

  const getYear = (dateString: string) => new Date(dateString).getFullYear();

  return (
    <div>

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

        {photos.map((photo, index) => {
          const currentYear = getYear(photo.photoDate);
          const prevYear = index > 0 ? getYear(photos[index - 1].photoDate) : currentYear;
          const nextYear = index < photos.length - 1 ? getYear(photos[index + 1].photoDate) : currentYear;

          return (
            <PhotoEntry
              key={index}
              photo={photo}
              index={index}
              totalPhotos={photos.length}
              scrollProgress={scrollProgress}
              currentYear={currentYear}
              prevYear={prevYear}
              nextYear={nextYear}
              imageDimensions={photoDimensions}
              onImageLoad={handleImageLoad}
              onImageClick={(photo: Photo) => setSelectedImage(photo)}
            />
          );
        })}
      </div>
    </div>
  );
}
