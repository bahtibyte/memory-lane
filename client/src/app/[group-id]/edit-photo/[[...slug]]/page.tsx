'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTimeline } from '@/app/context/timeline-context';
import Link from 'next/link';
import { PhotoEntry } from '@/app/utils/types';
import { editPhoto } from '@/app/utils/api';

interface PhotoFormData {
  photo_date: string;
  photo_title: string;
  photo_caption: string;
}

export default function EditPhotoPage() {
  const router = useRouter();
  const params = useParams();

  const group_id = params['group-id'] as string;
  const photo_id = parseInt(params.slug?.[0] || '0');

  const { memoryLane, loading, fetchData, setMemoryLane } = useTimeline();
  const [photoEntry, setPhotoEntry] = useState<PhotoEntry | null>(null);

  const [formData, setFormData] = useState<PhotoFormData>({
    photo_date: '',
    photo_title: '',
    photo_caption: '',
  });

  useEffect(() => { fetchData(group_id); }, [group_id, fetchData]);

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

  if (loading) {
    return (
      <div className="min-h-screen p-4 bg-[rgb(30,30,30)] flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!photoEntry) {
    return (
      <div className="min-h-screen p-4 bg-[rgb(30,30,30)] flex flex-col items-center justify-center">
        <h1 className="text-white text-2xl mb-4">Photo not found</h1>
        <Link href={`/${group_id}`} className="text-[#CCC7F8] hover:text-white underline">
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
      memory_lane: group_id,
      photo_id: photo_id,
      photo_title: formData.photo_title,
      photo_date: formData.photo_date,
      photo_caption: formData.photo_caption
    });

    if (result && memoryLane) {
      setMemoryLane({
        group_info: memoryLane.group_info,
        photo_entries: memoryLane.photo_entries.map(entry => entry.photo_id === photo_id ? result.updated_photo : entry)
      });
      router.push(`/${group_id}`);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[rgb(30,30,30)]">
      <div className="max-w-[600px] mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">Edit Photo</h1>

        <div className="relative w-full h-[400px] overflow-hidden rounded-lg mb-8">
          <div
            className="absolute inset-0 blur-xl scale-110"
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="photo_title" className="block text-white mb-2">Title</label>
            <input
              type="text"
              id="photo_title"
              name="photo_title"
              value={formData.photo_title}
              onChange={handleInputChange}
              className="w-full p-2 rounded bg-[rgb(45,45,45)] text-white border border-gray-600 focus:border-[#CCC7F8] focus:outline-none"
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
              className="w-full p-2 rounded bg-[rgb(45,45,45)] text-white border border-gray-600 focus:border-[#CCC7F8] focus:outline-none"
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
              className="w-full p-2 rounded bg-[rgb(45,45,45)] text-white border border-gray-600 focus:border-[#CCC7F8] focus:outline-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Link
              href={`/${group_id}`}
              className="flex-1 px-4 py-2 border border-[#CCC7F8] text-[#CCC7F8] rounded hover:bg-[#CCC7F8] hover:text-black transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#CCC7F8] text-black rounded hover:bg-white transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
