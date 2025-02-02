/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/core/context/auth-provider';
import { InitiateAuthCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { setTokens } from '@/core/utils/tokens';
import { getUser } from '@/core/utils/api';
import { useRouter } from 'next/navigation';
import { Routes } from '@/core/utils/routes';
import LoadingScreen from '@/app/components/Loading';

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

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

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

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    try {
      // TODO: Implement forgot password logic here
      console.log('Reset password for:', formData.email);
      setResetEmailSent(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while sending reset email');
    }
  };

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
          setError('Failed to retrieve user');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    }
  }

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log("isAuthenticated is true, pushing to my groups");
      router.push(Routes.MY_GROUPS_PAGE);
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || isAuthenticated) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-[#0E0E0E] p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-[#1A1A1A] border border-[#242424] rounded-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {showVerification
                ? 'Verify your account'
                : isForgotPassword
                  ? 'Reset Password'
                  : isLogin
                    ? 'Login to your account'
                    : 'Create your account'}
            </h2>
            <p className="text-gray-400 text-sm md:text-base mt-2">
              {showVerification
                ? 'Enter the verification code sent to your email'
                : isForgotPassword
                  ? 'Enter your email to receive password reset instructions'
                  : isLogin
                    ? 'Welcome back! Please enter your details'
                    : 'Get started by creating your account'}
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {showVerification ? (
            <form className="space-y-6" onSubmit={handleVerificationSubmit}>
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-200 mb-2">
                  Verification Code
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  maxLength={6}
                  className="w-full bg-[#0E0E0E] border border-[#242424] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300 transition-all duration-200"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-300 text-black rounded-lg px-4 py-2 font-medium hover:bg-purple-400 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-300/20 transition-all duration-200"
              >
                Verify Account
              </button>
            </form>
          ) : isForgotPassword ? (
            <>
              {resetEmailSent ? (
                <div className="text-center space-y-4">
                  <div className="mb-6 rounded-lg bg-green-500/10 p-4 text-sm text-green-400">
                    If an account exists with this email, you will receive password reset instructions shortly.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setResetEmailSent(false);
                    }}
                    className="text-purple-300 hover:text-purple-400 transition-colors text-sm"
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleForgotPasswordSubmit}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full bg-[#0E0E0E] border border-[#242424] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300 transition-all duration-200"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-4">
                    <button
                      type="submit"
                      className="w-full bg-purple-300 text-black rounded-lg px-4 py-2 font-medium hover:bg-purple-400 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-300/20 transition-all duration-200"
                    >
                      Send Reset Instructions
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(false)}
                      className="w-full bg-[#242424] text-white rounded-lg px-4 py-2 font-medium hover:bg-[#2A2A2A] transition-all duration-200"
                    >
                      Back to Login
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="w-full">
                <button
                  type="button"
                  className="w-full bg-[#0E0E0E] border border-[#242424] rounded-lg px-4 py-2 text-white hover:bg-[#242424] transition-all duration-200 flex items-center justify-center gap-3 box-border"
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
                  <div className="w-full border-t border-[#242424]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-[#1A1A1A] px-2 text-gray-400">or</span>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={!isLogin}
                    className="w-full bg-[#0E0E0E] border border-[#242424] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300 transition-all duration-200"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full bg-[#0E0E0E] border border-[#242424] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300 transition-all duration-200"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full bg-[#0E0E0E] border border-[#242424] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300 transition-all duration-200"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="mt-2 text-sm text-purple-300 hover:text-purple-400 transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              <div className="w-full">
                <button
                  type="submit"
                  className="w-full text-center bg-purple-300 text-black rounded-lg px-4 py-2 font-medium hover:bg-purple-400 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-300/20 transition-all duration-200 box-border"
                >
                  {isLogin ? 'Login' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          {!showVerification && !isForgotPassword && (
            <div className="mt-6 text-center">
              <button
                type="button"
                className="text-purple-300 hover:text-purple-400 transition-colors text-sm"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
