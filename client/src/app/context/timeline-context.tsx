'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { getMemoryLane } from '../utils/api';
import { MemoryLane } from '../utils/types';

interface TimelineContextType {
  memoryLane: MemoryLane | null;
  setMemoryLane: (data: MemoryLane | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  failedToLoad: boolean;
  setFailedToLoad: (failed: boolean) => void;
  fetchData: (group_id: string) => void;
}

const TimelineContext = createContext<TimelineContextType | undefined>(undefined);

export function TimelineProvider({ children }: { children: ReactNode }) {
  const [memoryLane, setMemoryLane] = useState<MemoryLane | null>(null);
  const [loading, setLoading] = useState(false);
  const [failedToLoad, setFailedToLoad] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const FETCH_COOLDOWN = 2000; // 2 seconds cooldown between fetches

  const fetchData = async (memory_lane: string | null) => {
    if (!memory_lane) {
      console.log('no memory_lane, not fetching');
      return;
    }
    if (failedToLoad) {
      console.log('failed to load, not fetching');
      return;
    }

    if (memoryLane && (memoryLane.group_info.uuid === memory_lane || memoryLane.group_info.alias === memory_lane)) {
      console.log('already have data, not fetching');
      return;
    }

    console.log('requesting a fetch for', memory_lane);
    const now = Date.now();
    if (now - lastFetchTime < FETCH_COOLDOWN) {
      console.log('fetching too frequently, skipping');
      return;
    }
    setLastFetchTime(now);
    setLoading(true);

    const data = await getMemoryLane(memory_lane);
    if (data) {
      setMemoryLane(data);
    } else {
      setFailedToLoad(true);
    }

    setLoading(false);
  };

  return (
    <TimelineContext.Provider
      value={{
        memoryLane,
        setMemoryLane,
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