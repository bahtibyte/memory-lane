'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { getMemoryLane } from '../../core/utils/api';
import { MemoryLane } from '../../core/utils/types';

interface MemoryLaneContextType {
  memoryLane: MemoryLane | null;
  setMemoryLane: (data: MemoryLane | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  failedToLoad: boolean;
  setFailedToLoad: (failed: boolean) => void;
  fetchData: (group_id: string) => void;
}

const MemoryLaneContext = createContext<MemoryLaneContextType | undefined>(undefined);

export function MemoryLaneProvider({ children }: { children: ReactNode }) {
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
    <MemoryLaneContext.Provider
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
    </MemoryLaneContext.Provider>
  );
}

export function useMemoryLane() {
  const context = useContext(MemoryLaneContext);
  if (context === undefined) {
    throw new Error('useMemoryLane must be used within a MemoryLaneProvider');
  }
  return context;
}