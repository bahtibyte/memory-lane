"use client";

import { sendSignUpCommand, sendVerifyCommand, sendLoginCommand, SIGNUP_HEADER, LOGIN_HEADER, VERIFY_HEADER } from "@/core/utils/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/core/utils/types";
import { getUser } from "@/core/utils/api";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  signUp: SIGNUP_HEADER;
  verify: VERIFY_HEADER;
  login: LOGIN_HEADER;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const user_result = await getUser();
      if (user_result) {
        handleSetUser(user_result);
      }
      setIsLoading(false);
    }
    initAuth();
  }, []);

  const handleSetUser = (user: User | null) => {
    setUser(user);
    setIsAuthenticated(user ? true : false);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        setUser: handleSetUser,
        signUp: sendSignUpCommand,
        verify: sendVerifyCommand,
        login: sendLoginCommand,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);