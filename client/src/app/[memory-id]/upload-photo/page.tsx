'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useTimeline } from '@/app/context/timeline-context';
import { generateS3Url , createPhotoEntry} from '@/app/utils/api';

export default function UploadPage() {
  const memory_id = useParams()['memory-id'] as string;
  const { memoryLane, setMemoryLane } = useTimeline();
  const groupName = memoryLane?.group_data.group_name || 'Loading...';

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingToS3, setIsUploadingToS3] = useState(false);

  const handlePhotoChange = async (file: File | null) => {
    if (photoUrl) {
      URL.revokeObjectURL(photoUrl);
    }

    if (file) {
      try {
        setIsUploadingToS3(true);
        // Check if file is an image
        if (!file.type.startsWith('image/')) {
          throw new Error('Please select an image file.');
        }

        // Check if file is HEIC and reject it
        const isHeic = file.type === 'image/heic' || 
                      file.type === 'image/heif' || 
                      file.name.toLowerCase().endsWith('.heic') ||
                      file.name.toLowerCase().endsWith('.heif');

        if (isHeic) {
          throw new Error('HEIC files are not supported. Please convert to JPEG or PNG before uploading.');
        }

        // Get S3 presigned URL
        const s3UrlData = await generateS3Url(file.name);
        console.log('S3 URL Data:', s3UrlData);

        if (s3UrlData.presignedUrl) {
          // Upload file to S3
          const uploadResponse = await fetch(s3UrlData.presignedUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type,
            },
          });

          if (!uploadResponse.ok) {
            throw new Error('Failed to upload file to S3');
          }
          console.log('File uploaded to S3', uploadResponse);
          // Use the S3 URL for preview
          setPhotoUrl(s3UrlData.photo_url);
          setPhoto(file);
        } else {
          throw new Error('Failed to get presigned URL');
        }
      } catch (error) {
        console.error('Error processing image:', error);
        setError(error instanceof Error ? error.message : 'Failed to process image.');
        setPhoto(null);
        setPhotoUrl('');
      } finally {
        setIsUploadingToS3(false);
      }
    } else {
      setPhotoUrl('');
      setPhoto(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    if (!photo || !title || !date) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    try {
      const result = await createPhotoEntry({
        memory_id: memory_id,
        title,
        caption,
        date,
        photo_url: photoUrl
      });

      if (result) {
        // Add the new photo to timeline data
        if (memoryLane) {
          setMemoryLane({
            group_data: memoryLane.group_data,
            photo_entries: [...memoryLane.photo_entries, result.photo_entry]
          });
        }

        setSuccess(true);
        // Reset form
        setTitle('');
        setCaption('');
        setDate('');
        setPhoto(null);
      } else {
        setError('Failed to upload photo. Please try again.');
      }
    } catch (error) {
      console.log("error uploading photo", error);
      setError('An error occurred while uploading the photo.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setTitle('');
    setCaption('');
    setDate('');
    setPhoto(null);
    setPhotoUrl('');
    setError('');
  };

  const truncateFileName = (fileName: string) => {
    if (fileName.length <= 16) return fileName;
    const extension = fileName.split('.').pop() || '';
    const nameWithoutExt = fileName.slice(0, fileName.lastIndexOf('.'));
    return `${nameWithoutExt.slice(0, 5)}...${extension}`;
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-[1000px] mb-8">
        <Link
          href={`/${memory_id}`}
          className="inline-flex items-center text-purple-300 hover:text-purple-400 transition-colors mb-8 md:mb-12"
        >
          <span className="mr-2">←</span> Back to Group
        </Link>

        <div className="space-y-4">
          <p className="text-purple-300 text-sm font-medium tracking-wider">UPLOAD PHOTO</p>
          <h1 className="text-white text-3xl md:text-4xl font-bold">{groupName}</h1>
          <p className="text-gray-400">Got a memory to share? Upload it to the timeline!</p>
        </div>
      </div>

      {/* Upload box or Form */}
      {!photo ? (
        <div className="h-[300px] md:h-[500px] w-full max-w-[1000px] bg-gradient-to-br from-purple-300/20 via-white/5 to-purple-400/20 rounded-3xl border-2 border-dashed border-purple-300/30 flex items-center justify-center p-4 md:p-8">
          {isUploadingToS3 && (
            <div className="text-center text-purple-300">
              <p>Uploading photo...</p>
            </div>
          )}
          
          {!isUploadingToS3 && (
            <div className="text-center">
              <input
                type="file"
                accept="image/*,.heic,.HEIC"
                onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)}
                className="hidden"
                id="photo-upload"
              />
              <label 
                htmlFor="photo-upload"
                className="cursor-pointer text-purple-300 hover:text-purple-400 transition-colors"
              >
                Drag and drop your photo here, or click to select
              </label>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#1A1A1A] rounded-3xl border border-purple-300/20 p-4 md:p-8 w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Image Preview */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="relative w-full h-full flex flex-col">
              <div className="w-full flex items-center justify-center flex-1">
                <div className="relative flex flex-col w-full">
                  <Image
                    src={photoUrl}
                    alt="Preview"
                    width={800}
                    height={800}
                    className="max-w-full max-h-[300px] md:max-h-[400px] w-auto h-auto object-contain"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                  <div className="bg-[#0E0E0E] border border-[#242424] py-2 px-4 rounded-lg mt-2 w-full">
                    <p className="text-[#CECECE] text-sm truncate text-center">
                      {truncateFileName(photo.name)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="w-full md:w-1/2 relative">
            <button
              type="button"
              onClick={resetForm}
              className="absolute top-0 right-0 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-purple-300 hover:text-purple-400 transition-colors text-2xl md:text-3xl"
            >
              ×
            </button>

            <h2 className="text-white text-xl md:text-2xl font-bold mb-4 md:mb-6">Add Photo Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div>
                <label htmlFor="title" className="block text-white-300 text-sm font-medium mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0E0E0E] border border-[#242424] rounded-lg px-4 py-2 text-[#CECECE] focus:outline-none focus:border-purple-300 placeholder-[#707070]"
                  placeholder="Untitled"
                  required
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-white-300 text-sm font-medium mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#0E0E0E] border border-[#242424] rounded-lg px-4 py-2 text-[#CECECE] focus:outline-none focus:border-purple-300 placeholder-[#707070] [color-scheme:dark]"
                  placeholder="mm/dd/yyyy"
                  required
                />
              </div>

              <div>
                <label htmlFor="caption" className="block text-white-300 text-sm font-medium mb-2">
                  Caption
                </label>
                <textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full bg-[#0E0E0E] border border-[#242424] rounded-lg px-4 py-2 text-[#CECECE] focus:outline-none focus:border-purple-300 h-24 resize-none placeholder-[#707070]"
                  placeholder="Add a caption to your memory..."
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-2 bg-purple-300 text-black rounded-lg hover:bg-purple-400 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Uploading...' : 'Upload Memory'}
              </button>
            </form>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg text-center md:text-left">
          {error}
        </div>
      )}

      {success && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto bg-green-500/10 border border-green-500 text-green-500 px-4 py-2 rounded-lg text-center md:text-left">
          Photo uploaded successfully!
        </div>
      )}
    </div>
  );
}
