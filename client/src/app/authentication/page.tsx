'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/core/context/auth-provider';
import { InitiateAuthCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { setTokens } from '@/core/utils/tokens';
import { getUser } from '@/core/utils/api';
import { useRouter } from 'next/navigation';
import { Routes } from '@/core/utils/routes';
import LoadingScreen from '@/app/shared/Loading';
import CreateAccount from '@/app/authentication/components/CreateAccount';
import VerifyAccount from './components/VerifyAccount';
import LoginAccount from './components/LoginAccount';
import ForgotPassword from './components/ForgotPassword';

enum Step {
  CREATE_ACCOUNT,
  VERIFY_ACCOUNT,
  LOGIN_ACCOUNT,
  FORGOT_PASSWORD,
}

export default function AuthPage() {
  const { isAuthenticated, isLoading, setUser } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<Step>(Step.CREATE_ACCOUNT);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(Routes.MY_GROUPS_PAGE);
    }
  }, [isLoading, isAuthenticated, router]);

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
    if (response.AuthenticationResult) {
      const tokens = response.AuthenticationResult;

      try {
        await setTokens(tokens.AccessToken!, tokens.RefreshToken!, tokens.ExpiresIn!);
      } catch (error) {
        console.error("Unable to set tokens: ", error);
      }

      const user = await getUser();
      if (user) {
        setUser(user);
      }
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
              onSuccess={goToVerifyAccount}
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
              onVerifyAccount={goToVerifyAccount}
              onSuccess={completeLogin}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
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
