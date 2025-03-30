'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Photo } from '@/core/utils/types';
import LoadingScreen from '@/app/shared/Loading';
import AccessDenied from '@/app/shared/memory/AccessDenied';
import PhotoUpload from './components/PhotoUpload';
import { useAppData } from '@/core/context/app-provider';
import PageNotFound from '@/app/shared/PageNotFound';
import FailedToLoad from '@/app/shared/memory/FailedToLoad';

export default function UploadPage() {
  const memoryId = useParams()['memory-id'] as string;

  const { appData, isLoading, isAuthorized, failedToLoad, fetchAppData, setAppData } = useAppData();
  const [uploadComplete, setUploadComplete] = useState(false);

  const groupName = appData?.group.groupName || 'Loading...';

  const handleSuccess = (photo: Photo) => {
    if (appData) {
      setAppData({
        ...appData,
        photos: [...appData.photos, photo],
      });
      setUploadComplete(true);
    }
  };

  const handleUploadAnother = () => {
    setUploadComplete(false);
  };

  useEffect(() => { fetchAppData(memoryId, null); }, [memoryId, fetchAppData]);

  if (isLoading) return <LoadingScreen />;
  if (!isAuthorized) return <AccessDenied />;
  if (failedToLoad) return <FailedToLoad />;
  if (!appData) return <PageNotFound />;

  return (
    <div className="min-h-screen bg-[#0E0E0E] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Link
          href={`/${memoryId}`}
          className="inline-flex items-center text-purple-300 hover:text-purple-400 transition-colors mb-6 md:mb-12"
        >
          <span className="mr-2">←</span> Back to Group
        </Link>

        <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
          <p className="text-purple-300 text-xs md:text-sm font-medium tracking-wider">UPLOAD PHOTO</p>
          <h1 className="text-white text-2xl md:text-4xl font-bold">{groupName}</h1>
          <p className="text-gray-400 text-sm md:text-base">Got a memory to share? Upload it to the timeline!</p>
        </div>

        {uploadComplete ? (
          <div className="flex items-center justify-center min-h-[50vh] md:min-h-[60vh]">
            <div className="bg-[#1A1A1A] border border-[#242424] rounded-lg p-4 md:p-8 max-w-2xl w-full mx-auto text-center">
              <div className="w-14 h-14 md:w-20 md:h-20 bg-purple-300/10 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <svg 
                  className="w-7 h-7 md:w-10 md:h-10 text-purple-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl md:text-3xl font-bold text-white mb-2">Upload Complete!</h2>
              <p className="text-gray-400 text-sm md:text-base mb-6 md:mb-8">Your photo has been successfully added to the timeline.</p>
              <div className="flex flex-col gap-3 md:flex-row md:gap-4 justify-center items-center">
                <button
                  onClick={handleUploadAnother}
                  className="inline-flex px-6 md:px-8 py-2.5 md:py-3 bg-purple-300 text-black rounded-lg hover:bg-purple-400 transition-colors font-medium text-sm md:text-base whitespace-nowrap"
                >
                  Upload Another Photo
                </button>
                <Link
                  href={`/${memoryId}`}
                  className="inline-flex px-6 md:px-8 py-2.5 md:py-3 bg-[#242424] text-purple-300 rounded-lg hover:bg-[#2A2A2A] transition-colors font-medium items-center justify-center text-sm md:text-base whitespace-nowrap"
                >
                  Back to Memory Lane
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <PhotoUpload 
            memoryId={memoryId} 
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </div>
  );
}
