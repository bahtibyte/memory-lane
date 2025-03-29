'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Photo } from '@/core/utils/types';
import { editPhoto } from '@/core/wrappers/api';
import AccessDenied from '@/app/shared/memory/AccessDenied';
import Loading from '@/app/shared/Loading';
import { useAppData } from '@/core/context/app-provider';
import FailedToLoad from '@/app/shared/memory/FailedToLoad';
import PageNotFound from '@/app/shared/memory/PageNotFound';

export default function EditPhotoPage() {
  const router = useRouter();
  const params = useParams();

  const memoryId = params['memory-id'] as string;
  const photoId = parseInt(params.slug?.[0] || '0');

  const { appData, isLoading, isAuthorized, failedToLoad, fetchAppData, setAppData } = useAppData();
  const [photo, setPhoto] = useState<Photo | null>(null);

  const [photoDate, setPhotoDate] = useState<string>('');
  const [photoTitle, setPhotoTitle] = useState<string>('');
  const [photoCaption, setPhotoCaption] = useState<string>('');

  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => { fetchAppData(memoryId, null); }, [memoryId, fetchAppData]);

  useEffect(() => {
    if (appData && photoId) {
      const photo = appData.photos.find(photo => photo.photoId === photoId);
      if (photo) {
        setPhoto(photo);
        setPhotoDate(photo.photoDate);
        setPhotoTitle(photo.photoTitle);
        setPhotoCaption(photo.photoCaption || '');
      }
    }
  }, [appData, photoId]);

  if (isLoading) return <Loading />;
  if (!isAuthorized) return <AccessDenied />
  if (failedToLoad) return <FailedToLoad />
  if (!appData) return <PageNotFound />;

  if (!photo) {
    return (
      <div className="min-h-screen p-4 bg-[#0E0E0E] flex flex-col items-center justify-center">
        <h1 className="text-white text-2xl mb-4">Photo not found</h1>
        <Link href={`/${memoryId}`} className="text-purple-300 hover:text-purple-400 underline">
          Go back to timeline
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    const { data } = await editPhoto(memoryId, photoId, photoTitle, photoCaption, photoDate);
    if (data) {
      setAppData({
        ...appData,
        photos: appData.photos.map(p => p.photoId === photoId ? data.photo : p)
      });
      router.push(`/${memoryId}`);
    }
    setIsUpdating(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#0E0E0E]">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link
          href={`/${memoryId}/edit-group`}
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
            Edit the photo&apos;s title, date, and caption.
          </p>
        </div>

        {/* Photo Preview */}
        <div className="bg-[#1A1A1A] border border-[#242424] rounded-lg p-6 mb-8">
          <div className="relative w-full h-[400px] overflow-hidden rounded-lg">
            <div
              className="absolute inset-0 blur-xl scale-110 opacity-50"
              style={{
                backgroundImage: `url(${photo.photoUrl})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
              }}
            />
            <Image
              src={photo.photoUrl}
              alt={photo.photoTitle || 'Photo preview'}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Form */}
        <div className="bg-[#1A1A1A] border border-purple-300/20 rounded-3xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="photo_title" className="block text-white-300 text-sm font-medium mb-2">
                Title <span className="text-white">*</span>
              </label>
              <input
                type="text"
                id="photo_title"
                name="photo_title"
                value={photoTitle}
                onChange={e => setPhotoTitle(e.target.value)}
                required
                className="w-full bg-[#0E0E0E] border border-[#242424] rounded-lg px-4 py-2 text-[#CECECE] focus:outline-none focus:border-purple-300 placeholder-[#707070]"
                placeholder="Untitled"
              />
            </div>

            <div>
              <label htmlFor="photo_date" className="block text-white-300 text-sm font-medium mb-2">
                Date <span className="text-white">*</span>
              </label>
              <input
                type="date"
                id="photo_date"
                name="photo_date"
                value={photoDate.split('T')[0]}
                onChange={e => setPhotoDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
                className="w-full bg-[#0E0E0E] border border-[#242424] rounded-lg px-4 py-2 text-[#CECECE] focus:outline-none focus:border-purple-300 placeholder-[#707070] [color-scheme:dark]"
              />
            </div>

            <div>
              <label htmlFor="photo_caption" className="block text-white-300 text-sm font-medium mb-2">Caption</label>
              <textarea
                id="photo_caption"
                name="photo_caption"
                value={photoCaption}
                onChange={e => setPhotoCaption(e.target.value)}
                rows={2}
                className="w-full bg-[#0E0E0E] border border-[#242424] rounded-lg px-4 py-2 text-[#CECECE] focus:outline-none focus:border-purple-300 h-24 resize-none placeholder-[#707070]"
                placeholder="Add a caption to your memory..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Link
                href={`/${memoryId}`}
                className={`flex-1 px-4 py-2 border border-purple-300 text-purple-300 rounded-lg hover:bg-purple-300 hover:text-black transition-colors text-center ${isLoading ? 'opacity-50 pointer-events-none' : ''
                  }`}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isUpdating}
                className={`flex-1 text-center px-4 py-2 bg-purple-300 text-black rounded-lg hover:bg-purple-400 transition-colors ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
