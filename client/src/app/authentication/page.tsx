'use client';

import React, { useEffect, useState } from 'react';
import { InitiateAuthCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { saveAuthenticationTokens } from '@/core/wrappers/tokens';
import { getUser } from '@/core/wrappers/api';
import { useRouter } from 'next/navigation';
import { Routes } from '@/core/utils/routes';

import LoadingScreen from '@/app/shared/Loading';
import CreateAccount from '@/app/authentication/components/CreateAccount';
import VerifyAccount from './components/VerifyAccount';
import LoginAccount from './components/LoginAccount';
import ForgotPassword from './components/ForgotPassword';
import { User } from '@/core/utils/types';

enum Step {
  CREATE_ACCOUNT,
  VERIFY_ACCOUNT,
  LOGIN_ACCOUNT,
  FORGOT_PASSWORD,
}

export default function AuthPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<Step>(Step.CREATE_ACCOUNT);

  // Fetch the user from the database.
  useEffect(() => {
    async function fetchUser() {
      const { data } = await getUser();
      if (data) {
        setUser(data.user);
      }
      setIsLoading(false);
    }
    fetchUser();
  }, []);

  // Redirect to the my groups page if the user is authenticated.
  useEffect(() => {
    if (!isLoading && user) {
      router.push(Routes.MY_GROUPS_PAGE);
    }
  }, [isLoading, user, router]);

  const goToVerifyAccount = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setStep(Step.VERIFY_ACCOUNT);
  }

  const handleLoginResetPassword = (email: string) => {
    setEmail(email);
    setStep(Step.FORGOT_PASSWORD);
  }

  const completeLogin = async (response: InitiateAuthCommandOutput) => {
    const tokens = response.AuthenticationResult;
    if (!tokens) return;

    // Save the tokens in the cookie so they can be used to fetch the data.
    await saveAuthenticationTokens(tokens.AccessToken!, tokens.RefreshToken!, tokens.ExpiresIn!);

    // Fetch the user from the database, after a successful login.
    const { data } = await getUser();
    if (data) {
      setUser(data.user);
    }
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-[#0E0E0E] p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-[#1A1A1A] border border-[#242424] rounded-lg p-6">

          {step === Step.CREATE_ACCOUNT && (
            <CreateAccount
              onLogin={() => setStep(Step.LOGIN_ACCOUNT)}
              onSuccess={goToVerifyAccount}
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
              onVerifyAccount={goToVerifyAccount}
              onSuccess={completeLogin}
              onResetPassword={handleLoginResetPassword}
            />
          )}

          {step === Step.FORGOT_PASSWORD && (
            <ForgotPassword
              filledEmail={email}
              onBack={() => setStep(Step.LOGIN_ACCOUNT)}
              onSuccess={completeLogin}
            />
          )}

        </div>
      </div>
    </div>
  );
}
