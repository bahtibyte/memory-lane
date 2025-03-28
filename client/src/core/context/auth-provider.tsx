"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  sendSignUpCommand,
  sendVerifyCommand,
  sendLoginCommand,
  sendForgotPasswordCommand,
  confirmForgotPasswordCommand,
  SIGNUP_HEADER,
  LOGIN_HEADER,
  VERIFY_HEADER,
  FORGOT_PASSWORD_HEADER,
  CONFIRM_FORGOT_PASSWORD_HEADER
} from "@/core/wrappers/cognito";
import { User } from "@/core/utils/types";
import { getUser } from "@/core/wrappers/fetch";

type AuthContextType = {
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  signUp: SIGNUP_HEADER;
  verify: VERIFY_HEADER;
  login: LOGIN_HEADER;
  forgotPassword: FORGOT_PASSWORD_HEADER;
  confirmForgotPassword: CONFIRM_FORGOT_PASSWORD_HEADER;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /*
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
  */
 
  const handleSetUser = (user: User | null) => {
    setUser(user);
    setIsAuthenticated(user ? true : false);
  }

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        setUser: handleSetUser,
        signUp: sendSignUpCommand,
        verify: sendVerifyCommand,
        login: sendLoginCommand,
        forgotPassword: sendForgotPasswordCommand,
        confirmForgotPassword: confirmForgotPasswordCommand,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);