'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/core/context/auth-provider';
import { InitiateAuthCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { setTokens } from '@/core/utils/tokens';
import { getUser } from '@/core/utils/api';
import { useRouter } from 'next/navigation';
import { Routes } from '@/core/utils/routes';
import LoadingScreen from '@/app/components/Loading';
import CreateAccount from '@/app/components/auth/CreateAccount';
import VerifyAccount from '../components/auth/VerifyAccount';
import LoginAccount from '../components/auth/LoginAccount';
import ForgotPassword from '../components/auth/ForgotPassword';

enum Step {
  CREATE_ACCOUNT,
  VERIFY_ACCOUNT,
  LOGIN_ACCOUNT,
  FORGOT_PASSWORD,
}

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, setUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<Step>(Step.CREATE_ACCOUNT);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log("isAuthenticated is true, pushing to my groups");
      router.push(Routes.MY_GROUPS_PAGE);
    }
  }, [isLoading, isAuthenticated, router]);

  const handleCreateAccountSuccess = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setStep(Step.VERIFY_ACCOUNT);
  }

  const handleLoginVerifyAccount = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setStep(Step.VERIFY_ACCOUNT);
  }

  const completeLogin = async (response: InitiateAuthCommandOutput) => {
    try {
      console.log("complete login response: ", response);

      if (response.AuthenticationResult) {
        const tokens = response.AuthenticationResult;
        console.log("tokens: ", tokens);
        await setTokens(tokens.AccessToken!, tokens.RefreshToken!, tokens.ExpiresIn!);
        console.log("tokens set successfully");

        const user = await getUser();
        if (user) {
          console.log("user from login is: ", user);
          setUser(user);
        } else {
          console.log("user from login is null");
          // setError('Failed to retrieve user');
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.log("error from login: ", err);
    }
  }

  if (isLoading || isAuthenticated) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-[#0E0E0E] p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-[#1A1A1A] border border-[#242424] rounded-lg p-6">

          {step === Step.CREATE_ACCOUNT && (
            <CreateAccount
              onLogin={() => setStep(Step.LOGIN_ACCOUNT)}
              onSuccess={handleCreateAccountSuccess}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          )}

          {step === Step.VERIFY_ACCOUNT && (
            <VerifyAccount
              email={email}
              password={password}
              onSuccess={completeLogin}
            />
          )}

          {step === Step.LOGIN_ACCOUNT && (
            <LoginAccount
              onSignup={() => setStep(Step.CREATE_ACCOUNT)}
              onForgotPassword={() => setStep(Step.FORGOT_PASSWORD)}
              onVerifyAccount={handleLoginVerifyAccount}
              onSuccess={completeLogin}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          )}

          {step === Step.FORGOT_PASSWORD && (
            <ForgotPassword
              onBack={() => setStep(Step.LOGIN_ACCOUNT)}
              onSuccess={completeLogin}
            />
          )}

        </div>
      </div>
    </div>
  );
}
