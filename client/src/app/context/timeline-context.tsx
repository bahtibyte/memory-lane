'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { getTimeline } from '../utils/api';
import { DUMMY_DATA } from '../data';

export interface TimelineData {
  group_id: string;
  group_name: string;
  photo_entries: PhotoEntry[];
  friends: { [key: string]: Friend };
  // Add other fields as needed
}

export interface PhotoEntry {
  photo_date: string;
  photo_url: string;
  photo_title: string;
  photo_caption: string;
  // Add other fields as needed
}

export interface Friend {
  name: string;
  // Add other fields as needed
}

interface TimelineContextType {
  timelineData: TimelineData | null;
  setTimelineData: (data: TimelineData | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  failedToLoad: boolean;
  setFailedToLoad: (failed: boolean) => void;
  fetchData: (group_id: string) => void;
}

const TimelineContext = createContext<TimelineContextType | undefined>(undefined);

export function TimelineProvider({ children }: { children: ReactNode }) {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(false);
  const [failedToLoad, setFailedToLoad] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const FETCH_COOLDOWN = 2000; // 2 seconds cooldown between fetches

  const fetchData = async (group_id: string | null) => {
    if (!group_id) {
      console.log('no group_id, not fetching');
      return;
    }
    if (failedToLoad) {
      console.log('failed to load, not fetching');
      return;
    }

    if (timelineData && timelineData.group_id === group_id) {
      console.log('already have data, not fetching');
      return;
    }

    console.log('requesting a fetch', group_id);
    const now = Date.now();
    if (now - lastFetchTime < FETCH_COOLDOWN) {
      console.log('fetching too frequently, skipping');
      return;
    }
    setLastFetchTime(now);
    setLoading(true);

    if (group_id === 'demo') {
      console.log('fetching demo data');
      setTimelineData(DUMMY_DATA);
      setFailedToLoad(false);
    } else {
      console.log('requesting real data', group_id);
      const data = await getTimeline(group_id);
      if (data) {
        setTimelineData(data);
      } else {
        setFailedToLoad(true);
      }
    }

    setLoading(false);
  };

  return (
    <TimelineContext.Provider
      value={{
        timelineData,
        setTimelineData,
        loading,
        setLoading,
        failedToLoad,
        setFailedToLoad,
        fetchData
      }}
    >
      {children}
    </TimelineContext.Provider>
  );
}

export function useTimeline() {
  const context = useContext(TimelineContext);
  if (context === undefined) {
    throw new Error('useTimeline must be used within a TimelineProvider');
  }
  return context;
}