'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMemoryLane } from '@/core/context/memory-provider';
import Link from 'next/link';
import { PhotoEntry } from '@/core/utils/types';
import { editPhoto } from '@/core/utils/api';
import AccessDenied from '@/app/components/AccessDenied';
import Loading from '@/app/components/Loading';

interface PhotoFormData {
  photo_date: string;
  photo_title: string;
  photo_caption: string;
}

export default function EditPhotoPage() {
  const router = useRouter();
  const params = useParams();

  const memory_id = params['memory-id'] as string;
  const photo_id = parseInt(params.slug?.[0] || '0');

  const { memoryLane, loading, unauthorized, fetchData, setMemoryLane } = useMemoryLane();
  const [photoEntry, setPhotoEntry] = useState<PhotoEntry | null>(null);

  const [formData, setFormData] = useState<PhotoFormData>({
    photo_date: '',
    photo_title: '',
    photo_caption: '',
  });

  useEffect(() => { fetchData(memory_id); }, [memory_id, fetchData]);

  useEffect(() => {
    if (memoryLane && photo_id) {
      const photo = memoryLane.photo_entries.find(entry => entry.photo_id === photo_id);
      if (photo) {
        setPhotoEntry(photo);
        setFormData({
          photo_date: photo.photo_date,
          photo_title: photo.photo_title,
          photo_caption: photo.photo_caption || ''
        });
      }
    }
  }, [memoryLane, photo_id]);

  if (unauthorized) {
    return <AccessDenied />
  }

  if (loading) {
    return <Loading />;
  }

  if (!photoEntry) {
    return (
      <div className="min-h-screen p-4 bg-[#0E0E0E] flex flex-col items-center justify-center">
        <h1 className="text-white text-2xl mb-4">Photo not found</h1>
        <Link href={`/${memory_id}`} className="text-purple-300 hover:text-purple-400 underline">
          Go back to timeline
        </Link>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement the API call to save the changes
    console.log('Saving changes:', formData);

    const result = await editPhoto({
      memory_id: memory_id,
      photo_id: photo_id,
      photo_title: formData.photo_title,
      photo_date: formData.photo_date,
      photo_caption: formData.photo_caption
    });

    if (result && memoryLane) {
      setMemoryLane({
        group_data: memoryLane.group_data,
        photo_entries: memoryLane.photo_entries.map(entry => entry.photo_id === photo_id ? result.updated_photo : entry),
        friends: memoryLane.friends
      });
      router.push(`/${memory_id}`);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#0E0E0E]">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link
          href={`/${memory_id}/edit-group`}
          className="inline-flex items-center text-purple-300 hover:text-purple-400 hover:scale-105 transition-all duration-200 mb-6 md:mb-8 text-sm"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Edit Group
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-purple-300 text-sm font-medium tracking-wider mb-2">
            <span>EDIT PHOTO</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Photo Details</h1>
          <p className="text-gray-400 text-sm md:text-base mt-2">
            Edit the photo&apos;s title, description, and date.
          </p>
        </div>

        {/* Photo Preview */}
        <div className="bg-[#1A1A1A] border border-[#242424] rounded-lg p-6 mb-8">
          <div className="relative w-full h-[400px] overflow-hidden rounded-lg">
            <div
              className="absolute inset-0 blur-xl scale-110 opacity-50"
              style={{
                backgroundImage: `url(${photoEntry.photo_url})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
              }}
            />
            <Image
              src={photoEntry.photo_url}
              alt={formData.photo_title || 'Photo preview'}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Form */}
        <div className="bg-[#1A1A1A] border border-[#242424] rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="photo_title" className="block text-white mb-2">Title</label>
              <input
                type="text"
                id="photo_title"
                name="photo_title"
                value={formData.photo_title}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-[#242424] text-white border border-[#333333] focus:border-purple-300 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="photo_caption" className="block text-white mb-2">Description</label>
              <textarea
                id="photo_caption"
                name="photo_caption"
                value={formData.photo_caption}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-2 rounded bg-[#242424] text-white border border-[#333333] focus:border-purple-300 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="photo_date" className="block text-white mb-2">Date</label>
              <input
                type="date"
                id="photo_date"
                name="photo_date"
                value={formData.photo_date.split('T')[0]}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-[#242424] text-white border border-[#333333] focus:border-purple-300 focus:outline-none"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Link
                href={`/${memory_id}`}
                className="flex-1 px-4 py-2 border border-purple-300 text-purple-300 rounded hover:bg-purple-300 hover:text-black transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="flex-1 text-center px-4 py-2 bg-purple-300 text-black rounded hover:bg-purple-400 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
