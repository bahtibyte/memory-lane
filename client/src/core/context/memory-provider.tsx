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
  fetchData: (memory_id: string | null, passcode?: string | null) => Promise<boolean | undefined>;
  unauthorized: boolean;
}

const MemoryLaneContext = createContext<MemoryLaneContextType | undefined>(undefined);

export function MemoryLaneProvider({ children }: { children: ReactNode }) {
  const [memoryLane, setMemoryLane] = useState<MemoryLane | null>(null);
  const [loading, setLoading] = useState(false);
  const [failedToLoad, setFailedToLoad] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [unauthorized, setUnauthorized] = useState(false);
  const FETCH_COOLDOWN = 2000; // 2 seconds cooldown between fetches

  const fetchData = async (memory_id: string | null, passcode: string | null = null) => {
    console.log("memorylane is ", memoryLane);
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
      return false;
    }
    setLastFetchTime(now);
    setLoading(true);

    try {
      const response = await getMemoryLane(memory_id, passcode);
      if (response.status === 403) {
        console.log("unauthorized setting it to true");
        setUnauthorized(true);
      } else {
        const data = await response.json();
        if (response.ok && data) {
          setMemoryLane(data);
          setUnauthorized(false);
        } else {
          setFailedToLoad(true);
        }
      }
    } catch (error) {
      console.log("Error fetching memory lane:", error);
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
        fetchData,
        unauthorized,
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