'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { StatsContainer } from '../shared/StatsContainer';
import { ImageOverlay } from '../shared/photos/ImageOverlay';
import LoadingScreen from '@/app/shared/Loading';
import PasswordProtected from '../shared/memory/PasswordProtected';
import UploadFirstPhoto from '../shared/memory/UploadFirstPhoto';
import PageNotFound from '../shared/memory/PageNotFound';
import FailedToLoad from '../shared/memory/FailedToLoad';
import { useAppData } from '@/core/context/app-provider';
import { sortPhotos } from '@/core/utils/helpers';
import { Photo } from '@/core/utils/types';
import Timeline from '../shared/photos/Timeline';

export default function MemoryLane() {
  const memoryId = useParams()['memory-id'] as string;
  const {
    isLoading,
    isAuthorized,
    protectedLane,
    failedToLoad,
    appData,
    fetchAppData
  } = useAppData();
  const [selectedImage, setSelectedImage] = useState<Photo | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => { fetchAppData(memoryId, null); }, [memoryId, fetchAppData]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;

      const progress = (scrollY / scrollableHeight) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return <LoadingScreen />
  }

  if (failedToLoad) {
    return <FailedToLoad />
  }

  if (protectedLane) {
    return <PasswordProtected memoryId={memoryId} />
  }

  if (!appData) {
    return <PageNotFound />
  }

  if (appData.photos.length === 0) {
    return <UploadFirstPhoto
      group={appData.group}
      isAuthorized={isAuthorized}
      memoryId={memoryId}
    />
  }

  // Update the data source for sorted entries and stats
  const sortedPhotos = sortPhotos(appData.photos);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#0E0E0E]">
      {selectedImage && <ImageOverlay photo={selectedImage} onClose={() => setSelectedImage(null)} />}

      <div className="max-w-[1000px] mx-auto">
        <StatsContainer
          photos={sortedPhotos}
          friendsCount={appData.friends.length}
          groupName={appData.group.groupName}
          isAuthorized={isAuthorized}
          memoryId={memoryId}
        />

        <Timeline
          photos={sortedPhotos}
          scrollProgress={scrollProgress}
          setSelectedImage={setSelectedImage}
        />
      </div>
    </div>
  );
}