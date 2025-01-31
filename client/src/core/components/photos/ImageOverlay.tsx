import Image from 'next/image';
import CloseIcon from '../icons/CloseIcon';

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
        <CloseIcon />
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