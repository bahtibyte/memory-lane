import Image from 'next/image';

interface ImageOverlayProps {
  image: {
    url: string;
    title: string;
  };
  onClose: () => void;
}

export function ImageOverlay({ image, onClose }: ImageOverlayProps) {
  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="relative w-full h-full p-4 flex items-center justify-center">
        <Image
          src={image.url}
          alt={image.title}
          className="max-h-[90vh] max-w-[90vw] object-contain"
          onClick={(e) => e.stopPropagation()}
          width={1920}
          height={1080}
        />
      </div>
    </div>
  );
}