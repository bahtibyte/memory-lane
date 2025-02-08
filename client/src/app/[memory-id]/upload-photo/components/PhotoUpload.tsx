'use client';

import { useState, FormEvent, DragEvent } from 'react';
import Image from 'next/image';
import { generateS3Url, createPhotoEntry } from '@/core/utils/api';
import { PhotoEntry } from '@/core/utils/types';

interface PhotoUploadProps {
  memory_id: string;
  onSuccess: (photoEntry: PhotoEntry) => void;
}

export default function PhotoUpload({ memory_id, onSuccess }: PhotoUploadProps) {
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingToS3, setIsUploadingToS3] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        // Set the date from file's last modified date
        setDate(new Date(file.lastModified).toISOString().split('T')[0]);

        // Get S3 presigned URL
        const s3UrlData = await generateS3Url(file.name, 'memories');

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

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length) {
      handlePhotoChange(files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
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
        onSuccess(result.photo_entry);
        resetForm();
      } else {
        setError('Failed to upload photo. Please try again.');
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      setError('An error occurred while uploading the photo.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCaption('');
    setDate('');
    setPhoto(null);
    setPhotoUrl('');
    setError('');
  };

  const truncateFileName = (fileName: string) => {
    if (fileName.length <= 25) return fileName;
    const extension = fileName.split('.').pop() || '';
    const nameWithoutExt = fileName.slice(0, fileName.lastIndexOf('.'));
    return `${nameWithoutExt.slice(0, 20)}...${extension}`;
  };

  return (
    <div className="w-full">
      {!photo ? (
        <div
          onClick={() => document.getElementById('photo-upload')?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="h-[300px] md:h-[500px] w-full bg-gradient-to-br from-purple-300/20 via-white/5 to-purple-400/20 rounded-3xl border-2 border-dashed border-purple-300/30 flex flex-col items-center justify-center p-4 md:p-8 cursor-pointer hover:border-purple-300/50 transition-all"
        >
          <input
            type="file"
            id="photo-upload"
            accept="image/*,.heic,.HEIC"
            onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)}
            className="hidden"
          />
           {isUploadingToS3 ? (
            <div className="text-sm text-purple-300 flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              File is uploading...
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <Image
                src={"/browseIcon.png"}
                alt="Upload"
                width={96}
                height={96}
                className="text-purple-300"

              />
              <div className="text-center space-y-2">
                <p className="text-purple-300 text-lg font-medium">
                  Drop your photo here
                </p>
                <p className="text-purple-300/60 text-sm">
                  or click to browse
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#1A1A1A] rounded-3xl border border-purple-300/20 p-4 md:p-8 w-full flex flex-col md:flex-row gap-6 md:gap-8">
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
                  max={new Date().toISOString().split('T')[0]}
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

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-[93%] bg-purple-300 text-black rounded-lg px-4 py-2 h-[42px] hover:bg-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Uploading...' : 'Upload Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg text-center md:text-left">
          {error}
        </div>
      )}
    </div>
  );
} 