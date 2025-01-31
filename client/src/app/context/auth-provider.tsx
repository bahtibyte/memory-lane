"use client";

import { createContext, useContext, useEffect, useState } from "react";

import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand
} from "@aws-sdk/client-cognito-identity-provider";

const CLIENT_ID = process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID;
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_AWS_COGNITO_REGION
});

type AuthContextType = {
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  getAccessToken: () => string | null;
  clearTokens: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const COOKIE_OPTIONS = {
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Function to set both tokens
  const setTokens = async (accessToken: string, refreshToken: string) => {
    // Set access token in regular cookie
    document.cookie = `access_token=${accessToken}; ${Object.entries(COOKIE_OPTIONS)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ')}`;

    // Set refresh token using API endpoint that sets HTTP-only cookie
    try {
      const response = await fetch('/api/auth/set-refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include', // This is crucial for cookies
      });
      
      if (!response.ok) {
        throw new Error('Failed to set refresh token');
      }
      
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error setting refresh token:', error);
      throw error;
    }
  };

  // Function to get access token from cookie
  const getAccessToken = (): string | null => {
    const cookies = document.cookie.split(';');
    const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
    return accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
  };

  // Function to clear both tokens
  const clearTokens = async () => {
    // Clear access token
    document.cookie = `access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${Object.entries(COOKIE_OPTIONS)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ')}`;

    // Clear refresh token using API endpoint
    try {
      await fetch('/api/auth/clear-refresh-token', {
        method: 'POST',
        credentials: 'include',
      });
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error clearing refresh token:', error);
      throw error;
    }
  };

  useEffect(() => {
    async function initAuth() {
      const accessToken = getAccessToken();
      if (accessToken) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    }
    initAuth();
  }, []);


  const handleSignUp = async (name: string, email: string, password: string) => {
    try {
      console.log("attempting to sign up with username and password.");
      const response = await cognitoClient.send(new SignUpCommand({
        ClientId: CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "name", Value: name }
        ],
      }));

      console.log("[auth]: Sign up response.", response);
    } catch (err) {
      console.error("[auth]: Error signing up with username and password.", err);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      console.log("attempting to login with username and password.");
      const response = await cognitoClient.send(new InitiateAuthCommand({
        ClientId: CLIENT_ID,
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      }));
      console.log("[auth]: Login response.", response);
    } catch (err) {
      console.error("[auth]: Error logging in with username and password.", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        signUp: handleSignUp,
        login: handleLogin,
        setTokens,
        getAccessToken,
        clearTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);