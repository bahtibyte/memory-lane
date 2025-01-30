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

  const fetchData = async (memory_id: string | null) => {
    if (!memory_id) {
      console.log('no memory_id, not fetching');
      return;
    }
    if (failedToLoad) {
      console.log('failed to load, not fetching');
      return;
    }

    if (memoryLane && (memoryLane.group_data.uuid === memory_id || memoryLane.group_data.alias === memory_id)) {
      console.log('already have data, not fetching');
      return;
    }

    console.log('requesting a fetch for', memory_id);
    const now = Date.now();
    if (now - lastFetchTime < FETCH_COOLDOWN) {
      console.log('fetching too frequently, skipping');
      return;
    }
    setLastFetchTime(now);
    setLoading(true);

    const data = await getMemoryLane(memory_id);
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