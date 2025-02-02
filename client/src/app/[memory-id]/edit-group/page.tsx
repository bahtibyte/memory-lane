'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useMemoryLane } from '@/core/context/memory-provider';
import EditGroupPrivacy from '@/app/components/edit-group/EditGroupPrivacy';
import EditGroupAlias from '@/app/components/edit-group/EditGroupAlias';
import EditGroupPhotos from '@/app/components/edit-group/EditGroupPhotos';
import Loading from '@/app/components/Loading';
import PageNotFound from '@/app/components/PageNotFound';
import Link from 'next/link';
import EditGroupName from '@/app/components/edit-group/EditGroupName';
import EditGroupFriends from '@/app/components/edit-group/EditGroupFriends';

export default function EditGroupPage() {
  const memory_id = useParams()['memory-id'] as string;
  const {
    memoryLane,
    setMemoryLane,
    loading,
    failedToLoad,
    fetchData
  } = useMemoryLane();

  useEffect(() => { fetchData(memory_id); }, [memory_id, fetchData]);

  if (loading) return <Loading />;
  if (!memory_id || failedToLoad || !memoryLane) return <PageNotFound />;

  return (
    <div className="min-h-screen bg-[#0E0E0E] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/my-groups"
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
          Back to Homepage
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
          memoryId={memory_id}
          initialGroupName={memoryLane.group_data.group_name ?? ''}
          memoryLane={memoryLane!}
          setMemoryLane={setMemoryLane}
          isAdmin={true}//for testing purposes
        />

        <EditGroupFriends/>

        {/* Existing Components */}
        <EditGroupPrivacy
          memoryId={memory_id}
          memoryLane={memoryLane}
          setMemoryLane={setMemoryLane}
        />
        <EditGroupAlias
          memoryId={memory_id}
          memoryLane={memoryLane}
          setMemoryLane={setMemoryLane}
        />
        <EditGroupPhotos
          memoryId={memory_id}
          memoryLane={memoryLane}
          setMemoryLane={setMemoryLane}
        />
      </div>
    </div>
  );
}
