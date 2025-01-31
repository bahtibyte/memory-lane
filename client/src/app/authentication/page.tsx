/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/core/context/auth-provider';
import { InitiateAuthCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { setTokens } from '@/core/utils/tokens';
import { getUser } from '@/core/utils/api';
import { useRouter } from 'next/navigation';
import { Routes } from '@/core/utils/routes';
import LoadingScreen from '@/core/components/Loading';

export default function AuthPage() {
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');

  const { isAuthenticated, isLoading, setUser, signUp, verify, login } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    if (isLogin) {
      try {
        const response = await login(formData.email, formData.password);
        console.log("login response: ", response);
        if (response) {
          await completeLogin(response);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred during login');
      }
    } else {
      try {
        const response = await signUp(formData.name, formData.email, formData.password);
        if (!response) {
          setError('Signup failed. Please try again.');
        } else if (response.UserConfirmed === false) {
          setShowVerification(true);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred during signup');
      }
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Verification code:', verificationCode);
    try {
      const response = await verify(formData.email, verificationCode);
      console.log("verification response: ", response);
      if (!response) {
        setError('Verification failed. Please try again.');
      } else if (response.Session) {
        // Verifiction was good, do a internal login here.
        const response = await login(formData.email, formData.password);
        console.log("verify login response: ", response);

        if (response) {
          await completeLogin(response);
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during verification');
    }
  };

  const completeLogin = async (response: InitiateAuthCommandOutput) => {
    try {
      console.log("complete login response: ", response);

      if (response.AuthenticationResult) {
        const tokens = response.AuthenticationResult;
        console.log("tokens: ", tokens);
        await setTokens(tokens.AccessToken!, tokens.RefreshToken!);
        console.log("tokens set successfully");

        const user = await getUser();
        if (user) {
          console.log("user from login is: ", user);
          setUser(user);
        } else {
          setError('Failed to retrieve user');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      console.log("isAuthenticated is true, pushing to my groups");
      router.push(Routes.MY_GROUPS);
    }
  }, [isAuthenticated, router]);

  if (isLoading || isAuthenticated) {
    return <LoadingScreen />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-gray-800 p-8 shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">
            {showVerification
              ? 'Verify your account'
              : isLogin
                ? 'Login to your account'
                : 'Create your account'}
          </h2>
        </div>

        {error && (
          <div className="rounded-md bg-red-500 bg-opacity-10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {showVerification ? (
          <form className="mt-8 space-y-6" onSubmit={handleVerificationSubmit}>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-200">
                Verification Code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                maxLength={6}
                className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
              />
            </div>

            <div className="px-1">
              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Verify Account
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-600 bg-gray-700 py-2 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                onClick={() => {
                  // TODO: Implement Google SSO
                  console.log('Google SSO clicked');
                }}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-gray-800 px-2 text-gray-400">or</span>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-200">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required={!isLogin}
                  className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>

            <div className="px-1">
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 flex items-center justify-center"
              >
                {isLogin ? 'Login' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        {!showVerification && (
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-blue-400 hover:text-blue-300"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
