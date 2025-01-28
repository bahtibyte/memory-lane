'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { PhotoEntry, useTimeline } from '@/app/context/timeline-context';
import { generateS3Url , createPhotoEntry} from '@/app/utils/api';

export default function UploadPage() {
  const group_id = useParams()['group-id'] as string;
  const { timelineData, setTimelineData } = useTimeline();

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [groupUrl, setGroupUrl] = useState('');
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
        group_id,
        title,
        caption,
        date,
        photo_url: photoUrl
      });

      if (result) {
        // Add the new photo to timeline data
        if (timelineData) {
          const newPhotoEntry: PhotoEntry = {
            photo_date: date,
            photo_url: result.photo_url,
            photo_title: title,
            photo_caption: caption
          };

          setTimelineData({
            ...timelineData,
            photo_entries: [...timelineData.photo_entries, newPhotoEntry]
          });
        }

        setSuccess(true);
        setGroupUrl(result.group_url);
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

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link
        href={`/${group_id}`}
        className="inline-block mb-4 text-blue-500 hover:text-blue-600"
      >
        ← Back to Group
      </Link>

      <h1 className="text-2xl font-bold mb-6">Upload Photo</h1>

      {!success && (
        <div className="space-y-4">
          <div>
            <label className="block mb-2">Photo*</label>
            {isUploadingToS3 && (
              <div className="mt-2 p-2 bg-blue-100 text-blue-700 rounded">
                Photo is being uploaded, please wait...
              </div>
            )}
            {photo && photoUrl && (
              <>
                <div className="relative w-full h-[400px] overflow-hidden rounded-lg">
                  <div
                    className="absolute inset-0 blur-xl scale-110"
                    style={{
                      backgroundImage: `url(${photoUrl})`,
                      backgroundPosition: 'center',
                      backgroundSize: 'cover',
                    }}
                  />
                  <Image
                    src={photoUrl}
                    alt="Preview"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  Photo URL: {photoUrl}
                </div>
              </>
            )}
            <div className="mt-4">
              <input
                type="file"
                accept="image/*,.heic,.HEIC"
                onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)}
                className="w-full p-2 border rounded text-white"
                required
              />
            </div>
          </div>

          {photo && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2">Title*</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border rounded text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">Caption</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full p-2 border rounded text-gray-900"
                  rows={3}
                />
              </div>

              <div>
                <label className="block mb-2">Date*</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2 border rounded text-gray-900"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
              >
                {isLoading ? 'Uploading...' : 'Upload Photo'}
              </button>
            </form>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
          <button
            onClick={() => setError('')}
            className="ml-4 text-blue-500 hover:text-blue-600"
          >
            Try Again
          </button>
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
          Photo uploaded successfully!
          {groupUrl && (
            <div className="mt-2">
              View your group: <Link href={groupUrl} className="text-blue-500 underline" rel="noopener noreferrer">{groupUrl}</Link>
            </div>
          )}
          <button
            onClick={resetForm}
            className="mt-4 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Upload Another Photo
          </button>
        </div>
      )}

      {isLoading && (
        <div className="mt-4 p-3 bg-blue-100 text-blue-700 rounded">
          Uploading photo... Please wait.
        </div>
      )}
    </div>
  );
}
