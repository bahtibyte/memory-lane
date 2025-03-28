'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateS3Url, updateGroupName, updateGroupThumbnail } from '@/core/wrappers/fetch';
import { MemoryLane } from '@/core/utils/types';
import Image from 'next/image';

interface EditGroupNameProps {
  memoryId: string;
  initialGroupName: string;
  memoryLane: MemoryLane;
  setMemoryLane: (data: MemoryLane) => void;
  isAdmin: boolean;
}

export default function EditGroupName({
  memoryId,
  initialGroupName,
  memoryLane,
  setMemoryLane,
  isAdmin
}: EditGroupNameProps) {
  const router = useRouter();
  const [groupName, setGroupName] = useState(initialGroupName);
  const [showNameSuccess, setShowNameSuccess] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showThumbnailSuccess, setShowThumbnailSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupName(e.target.value);
  };

  const handleEditClick = () => {
    if (!isAdmin) return;
    setIsEditingName(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const handleNameSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await updateGroupName({
        memory_id: memoryId,
        group_name: groupName
      });
      
      if (result.group_data) {
        setMemoryLane({
          group_data: result.group_data,
          photo_entries: memoryLane.photo_entries,
          friends: memoryLane.friends
        });
        setShowNameSuccess(true);
        setIsEditingName(false);
      }
      
      setTimeout(() => {
        setShowNameSuccess(false);
      }, 3000);

      router.refresh();
    } catch (error) {
      console.error('Error updating group name:', error);
    }
  };

  const handleThumbnailClick = () => {
    if (!isAdmin) return;
    fileInputRef.current?.click();
    console.log('clicked');
  };

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setThumbnailError(null);
      console.log('trying to update file', file);

      if (!file.type.startsWith('image/')) {
        setThumbnailError('Please select an image file.');
        return;
      }

      const isHeic = file.type === 'image/heic' ||
        file.type === 'image/heif' ||
        file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif');

      if (isHeic) {
        setThumbnailError('HEIC files are not supported.');
        return;
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      const s3UrlData = await generateS3Url(file.name, 'thumbnail');

      console.log("s3UrlData", s3UrlData);
      if (s3UrlData.presignedUrl) {
        const uploadResponse = await fetch(s3UrlData.presignedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        console.log("uploadResponse", uploadResponse);
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file to S3');
        }

        const result = await updateGroupThumbnail({
          memory_id: memoryId,
          thumbnail_url: s3UrlData.photo_url
        });

        console.log("result", result);
        if (result.group_data) {
          setMemoryLane({
            group_data: result.group_data,
            photo_entries: memoryLane.photo_entries,
            friends: memoryLane.friends
          });

          setShowThumbnailSuccess(true);
        } else {
          throw new Error('Failed to update group thumbnail');
        }
      }
    } catch (error) {
      console.error('Error updating thumbnail:', error);
      if (error instanceof Error) {
        setThumbnailError(error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const thumbnail = previewUrl ? previewUrl : memoryLane.group_data.thumbnail_url;

  return (
    <div className="bg-[#1A1A1A] border border-[#242424] rounded-lg p-4 md:p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Thumbnail Section */}
        <div className="w-full md:w-64">
          <label className="block text-white font-medium mb-2">Group Thumbnail</label>
          <div
            className={`relative w-full aspect-[16/9] rounded-lg overflow-hidden border-2 border-dashed ${isAdmin ? 'border-gray-300/50 hover:border-gray-300 cursor-pointer' : 'border-gray-600 cursor-not-allowed'
              } transition-colors`}
            onClick={handleThumbnailClick}
          >
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt="Group thumbnail"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 256px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0E0E0E]">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-300"></div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.heic,.HEIC"
              onChange={handleThumbnailChange}
              className="hidden"
              disabled={!isAdmin}
            />
          </div>
          {uploading && (
            <div className="text-sm text-purple-300 mt-2 flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              File is uploading...
            </div>
          )}
          {thumbnailError && (
            <div className="text-sm text-red-400 mt-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {thumbnailError}
            </div>
          )}
          {showThumbnailSuccess && (
            <div className="text-sm text-green-400 mt-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Thumbnail updated
            </div>
          )}
        </div>

        {/* Group Name Section */}
        <div className="flex-1">
          <label className="block text-white font-medium mb-2">Group Name</label>
          <form onSubmit={handleNameSave} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <div 
                className={`relative w-full ${isAdmin && !isEditingName ? 'cursor-pointer' : ''}`}
                onClick={!isEditingName ? handleEditClick : undefined}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={groupName}
                  onChange={handleNameChange}
                  className={`w-full bg-[#0E0E0E] border border-[#242424] rounded-lg px-4 py-2 text-white transition-all duration-200 ${
                    isAdmin 
                      ? 'focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300' 
                      : 'cursor-not-allowed'
                  }`}
                  placeholder="Enter group name"
                  readOnly={!isEditingName || !isAdmin}
                />
                {!isEditingName && isAdmin && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-purple-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
                {!isAdmin && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            {isEditingName && isAdmin && (
              <button
                type="submit"
                className="px-6 py-2 bg-purple-300 text-black rounded-lg hover:bg-purple-400 hover:scale-105 hover:shadow-lg hover:shadow-purple-300/20 transition-all duration-200 whitespace-nowrap font-medium"
              >
                Save Name
              </button>
            )}
          </form>
          {showNameSuccess && (
            <div className="text-sm text-green-400 mt-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Group name updated successfully
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
