'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import EditGroupPrivacy from '@/app/[memory-id]/edit-group/components/EditGroupPrivacy';
import EditGroupAlias from '@/app/[memory-id]/edit-group/components/EditGroupAlias';
import EditGroupPhotos from '@/app/[memory-id]/edit-group/components/EditGroupPhotos';
import Loading from '@/app/shared/Loading';
import PageNotFound from '@/app/shared/PageNotFound';
import Link from 'next/link';
import EditGroupName from '@/app/[memory-id]/edit-group/components/EditGroupName';
import EditGroupFriends from '@/app/[memory-id]/edit-group/components/EditGroupFriends';
import AccessDenied from '@/app/shared/memory/AccessDenied';
import { useAppData } from '@/core/context/app-provider';
import FailedToLoad from '@/app/shared/memory/FailedToLoad';

export default function EditGroupPage() {
  const memoryId = useParams()['memory-id'] as string;

  const { appData, isLoading, isAuthorized, failedToLoad, fetchAppData, setAppData } = useAppData();

  useEffect(() => { fetchAppData(memoryId, null); }, [memoryId, fetchAppData]);

  const onDeletePhoto = (photoId: number) => {
    if (!appData) return;
    setAppData({
      ...appData,
      photos: appData.photos.filter(p => p.photoId !== photoId)
    });
  };

  if (isLoading) return <Loading />;
  if (!isAuthorized) return <AccessDenied />
  if (failedToLoad) return <FailedToLoad />
  if (!appData) return <PageNotFound />;

  return (
    <div className="min-h-screen bg-[#0E0E0E] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/${memoryId}`}
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
          Back to Memory
        </Link>

        {/* Header with Admin Status */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-purple-300 text-sm font-medium tracking-wider mb-2">
            <span>SETTINGS</span>
            <span className="text-gray-500">•</span>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>ADMIN</span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Edit Group</h1>
          <p className="text-gray-400 text-sm md:text-base mt-2">
            Edit the group name, remove and add friends, and toggle other settings.
          </p>
        </div>

        <EditGroupName
          memoryId={memoryId}
          appData={appData}
          setAppData={setAppData}
          isAdmin={true}//for testing purposes
        />

        <EditGroupFriends
          memoryId={memoryId}
          appData={appData}
          setAppData={setAppData}
        />

        <EditGroupPrivacy
          memoryId={memoryId}
          appData={appData}
          setAppData={setAppData}
        />
        <EditGroupAlias
          memoryId={memoryId}
          appData={appData}
          setAppData={setAppData}
        />
        <EditGroupPhotos
          memoryId={memoryId}
          photos={appData.photos}
          onDeletePhoto={onDeletePhoto}
        />
      </div>
    </div>
  );
}
