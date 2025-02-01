'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemoryLane } from '@/core/context/memory-provider';
import { generateS3Url , createPhotoEntry} from '@/core/utils/api';

import PhotoUpload from '@/app/[memory-id]/upload-photo/PhotoUpload';
import { useEffect, useState } from 'react';

export default function UploadPage() {
  const memory_id = useParams()['memory-id'] as string;
  const { memoryLane, setMemoryLane, fetchData } = useMemoryLane();
  const [uploadComplete, setUploadComplete] = useState(false);

  const groupName = memoryLane?.group_data.group_name || 'Loading...';

  const handleSuccess = (photoEntry: any) => {
    if (memoryLane) {
      setMemoryLane({
        group_data: memoryLane.group_data,
        photo_entries: [...memoryLane.photo_entries, photoEntry]
      });
      setUploadComplete(true);
    }
  };

  const handleUploadAnother = () => {
    setUploadComplete(false);
  };

  useEffect(() => { fetchData(memory_id); }, [memory_id, fetchData]);
  return (
    <div className="min-h-screen bg-[#0E0E0E] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Link
          href={`/${memory_id}`}
          className="inline-flex items-center text-purple-300 hover:text-purple-400 transition-colors mb-8 md:mb-12"
        >
          <span className="mr-2">←</span> Back to Group
        </Link>

        <div className="space-y-4 mb-8">
          <p className="text-purple-300 text-sm font-medium tracking-wider">UPLOAD PHOTO</p>
          <h1 className="text-white text-3xl md:text-4xl font-bold">{groupName}</h1>
          <p className="text-gray-400">Got a memory to share? Upload it to the timeline!</p>
        </div>

        {uploadComplete ? (
          <div className="space-y-4">
            <p className="text-green-400">Photo uploaded successfully!</p>
            <div className="flex gap-4">
              <button
                onClick={handleUploadAnother}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
              >
                Upload Another Photo
              </button>
              <Link
                href={`/${memory_id}`}
                className="px-6 py-3 bg-purple-300 hover:bg-purple-400 text-purple-900 rounded-md transition-colors"
              >
                Go to Memory Lane
              </Link>
            </div>
          </div>
        ) : (
          <PhotoUpload 
            memory_id={memory_id} 
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </div>
  );
}
