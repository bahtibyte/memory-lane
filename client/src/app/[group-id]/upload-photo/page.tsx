'use client';

import { useState, FormEvent } from 'react';
import { uploadPhoto } from '@/app/utils/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function UploadPage() {
  const group_id = useParams()['group-id'] as string;

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const [groupUrl, setGroupUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      const result = await uploadPhoto({
        group_id,
        title,
        caption,
        date,
        photo
      });

      if (result) {
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Photo*</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Title*</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>

          <div>
            <label className="block mb-2">Date*</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border rounded"
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
