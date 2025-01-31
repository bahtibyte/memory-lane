'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useMemoryLane } from '@/core/context/memory-provider';
import EditGroupName from '@/core/components/edit-group/EditGroupName';
import EditGroupPrivacy from '@/core/components/edit-group/EditGroupPrivacy';
import EditGroupAlias from '@/core/components/edit-group/EditGroupAlias';
import EditGroupPhotos from '@/core/components/edit-group/EditGroupPhotos';
import BackToGroup from '@/core/components/BackToGroup';
import Loading from '@/core/components/Loading';
import PageNotFound from '@/core/components/PageNotFound';

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

  if (loading) {
    return <Loading />;
  }

  if (!memory_id || failedToLoad || !memoryLane) {
    return <PageNotFound />;
  }

  return (
    <div className="container mx-auto p-4 max-w-[1000px] mx-auto">

      <BackToGroup groupId={memory_id} />

      <EditGroupName
        memoryId={memory_id}
        initialGroupName={memoryLane.group_data.group_name ?? ''}
        memoryLane={memoryLane!}
        setMemoryLane={setMemoryLane}
      />

      <EditGroupPrivacy
        memoryId={memory_id}
        memoryLane={memoryLane!}
        setMemoryLane={setMemoryLane}
      />

      <EditGroupAlias
        memoryId={memory_id}
        memoryLane={memoryLane!}
        setMemoryLane={setMemoryLane}
      />

      <EditGroupPhotos
        memoryId={memory_id}
        memoryLane={memoryLane!}
        setMemoryLane={setMemoryLane}
      />
    </div>
  );
}
