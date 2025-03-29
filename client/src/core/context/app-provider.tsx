'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { AppData, User } from "../utils/types";
import { getMainApp, getUser } from "../wrappers/api";

// Minimum 2 seconds between fetches to avoid rate limiting.
const FETCH_COOLDOWN = 2000;

/**
 * Determines if the fetch should be rejected due to the current state of the app.
 * 
 * @param memoryId The memory ID to check.
 * @param failedToLoad Whether the app has failed to load.
 * @param appData The current app data.
 * @returns True if the fetch should be rejected, false otherwise.
 */
function shouldRejectFetch(memoryId: string | null, failedToLoad: boolean, appData: AppData | null) {
  if (!memoryId) return true;
  if (failedToLoad) return true;

  if (appData && (appData.group.uuid === memoryId || appData.group.alias === memoryId)) {
    return true;
  }

  return false;
}

/**
 * The state of the current app, used to conditionally render UI components.
 */
interface AppDataContextType {
  isLoading: boolean;
  loadingUser: boolean;
  isAuthorized: boolean;
  protectedLane: boolean;
  failedToLoad: boolean;
  appData: AppData | null;
  user: User | null;
  fetchAppData: (memoryId: string | null, passcode: string | null) => Promise<void>;
  setAppData: (appData: AppData) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

/**
 * Provides the central app data to all the required components.
 * 
 * @returns AppDataProvider component with necessary core data.
 */
export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [protectedLane, setProtectedLane] = useState<boolean>(false);
  const [failedToLoad, setFailedToLoad] = useState<boolean>(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Fetch the user from the database on load.
  useEffect(() => {
    async function initAuth() {
      setLoadingUser(true);
      const { data } = await getUser();
      if (data) {
        setUser(data.user);
        setIsAuthorized(data.user ? true : false);
      }
      setLoadingUser(false);
    }
    initAuth();
  }, []);

  const fetchAppData = async (memoryId: string | null, passcode: string | null) => {
    // Does not meet the criteria to fetch data.
    if (shouldRejectFetch(memoryId, failedToLoad, appData)) return;

    // Maintain a cooldown to avoid rate limiting and overfetching due to re-renders.
    const now = Date.now();
    if (now - lastFetchTime < FETCH_COOLDOWN) return;
    setLastFetchTime(now);

    // Start the loading process.
    setIsLoading(true);

    // Fetch the data from the server and sets appropriate app states.
    const { data, code } = await getMainApp(memoryId, passcode);

    const userExists = data && data.user !== undefined && data.user !== null;
    setIsAuthorized(userExists);
    if (code === 403) {
      setProtectedLane(true);
    } else if (code !== 200) {
      setFailedToLoad(true);
    } else {
      setAppData(data);
    }

    // Everything is loaded, set the loading state to false.
    setIsLoading(false)
  }

  return (
    <AppDataContext.Provider
      value={{
        isLoading,
        loadingUser,
        isAuthorized,
        protectedLane,
        failedToLoad,
        appData,
        user,
        fetchAppData,
        setAppData
      }}
    >
      {children}
    </AppDataContext.Provider>
  )
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within a AppDataProvider');
  }
  return context;
}
