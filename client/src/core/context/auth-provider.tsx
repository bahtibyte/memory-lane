"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  SignUpCommandOutput,
  ConfirmSignUpCommand,
  ConfirmSignUpCommandOutput,
  InitiateAuthCommandOutput
} from "@aws-sdk/client-cognito-identity-provider";
import { User } from "../utils/types";
import { getUser } from "../utils/api";

const CLIENT_ID = process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID;
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_AWS_COGNITO_REGION
});

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  signUp: (name: string, email: string, password: string) => Promise<SignUpCommandOutput | null>;
  verify: (email: string, code: string) => Promise<ConfirmSignUpCommandOutput | null>;
  login: (email: string, password: string) => Promise<InitiateAuthCommandOutput | null>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      console.log("initializing auth");
      const user_result = await getUser();
      console.log("user_result: ", user_result);
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

  const handleSignUp = async (name: string, email: string, password: string): Promise<SignUpCommandOutput | null> => {
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
      return response;
    } catch (err) {
      console.error("[auth]: Error signing up with username and password.", err);
      throw err;
    }
  };

  const handleVerify = async (email: string, code: string): Promise<ConfirmSignUpCommandOutput | null> => {
    try {
      const response = await cognitoClient.send(new ConfirmSignUpCommand({
        ClientId: CLIENT_ID,
        Username: email,
        ConfirmationCode: code,
      }));
      return response;
    } catch (err) {
      console.error("[auth]: Error verifying sign up with username and password.", err);
      throw err;
    }
  };

  const handleLogin = async (email: string, password: string): Promise<InitiateAuthCommandOutput | null> => {
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
      return response
    } catch (err) {
      console.error("[auth]: Error logging in with username and password.", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        setUser: handleSetUser,
        signUp: handleSignUp,
        verify: handleVerify,
        login: handleLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);