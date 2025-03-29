/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import GoogleSSOForm from "./misc/GoogleSSOForm";
import OrDivider from "./misc/OrDivider";
import { InitiateAuthCommandOutput } from "@aws-sdk/client-cognito-identity-provider";
import ErrorIcon from "@/app/shared/icons/ErrorIcon";
import HomeLink from "./misc/HomeLink";
import { sendLoginCommand } from "@/core/wrappers/cognito";

interface LoginAccountProps {
  onSignup: () => void;
  onForgotPassword: () => void;
  onVerifyAccount: (email: string, password: string) => void;
  onResetPassword: (email: string) => void;
  onSuccess: (response: InitiateAuthCommandOutput) => Promise<void>;
}

export default function LoginAccount({ onSuccess, onSignup, onForgotPassword, onVerifyAccount, onResetPassword }: LoginAccountProps) {

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await sendLoginCommand(email, password);
      if (response) {
        onSuccess(response);
      }
    } catch (err: any) {
      if (err.name === "UserNotConfirmedException") {
        onVerifyAccount(email, password);
      } else if (err.name === "PasswordResetRequiredException") {
        onResetPassword(email);
      } else {
        setError(err.message || 'An error occurred during login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <HomeLink />

      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Login to your account
        </h2>
        <p className="text-gray-400 text-sm md:text-base mt-2">
          Welcome back! Please enter your details
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-400 flex items-center gap-2">
          <ErrorIcon />
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>

        <GoogleSSOForm />

        <OrDivider />

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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0E0E0E] border border-[#242424] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-300 transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={onForgotPassword}
            className="mt-2 text-sm text-purple-300 hover:text-purple-400 transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <div className="w-full">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-center bg-purple-300 text-black rounded-lg px-4 py-2 font-medium hover:bg-purple-400 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-300/20 transition-all duration-200 box-border disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>

      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          disabled={isLoading}
          className="text-purple-300 hover:text-purple-400 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onSignup}
        >
          Don&apos;t have an account? Sign up
        </button>
      </div>
    </div>
  );
}