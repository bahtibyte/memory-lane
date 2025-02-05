/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuth } from "@/core/context/auth-provider";
import { InitiateAuthCommandOutput } from "@aws-sdk/client-cognito-identity-provider";
import { useState } from "react";

interface ForgotPasswordProps {
  onBack: () => void;
  onSuccess: (response: InitiateAuthCommandOutput) => void;
}

export default function ForgotPassword({ onBack, onSuccess }: ForgotPasswordProps) {

  const { forgotPassword, confirmForgotPassword, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pinCode, setPinCode] = useState('');

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    try {
      const response = await forgotPassword(email);
      console.log("forgot password response: ", response);
      setResetEmailSent(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while sending reset email');
    }
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await confirmForgotPassword(email, pinCode, password);
      if (response && response.$metadata.httpStatusCode === 200) {
        const response = await login(email, password);
        if (response) {
          onSuccess(response);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Invalid PIN code');
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Reset Password
        </h2>
        <p className="text-gray-400 text-sm md:text-base mt-2">
          Enter your email to receive password reset instructions
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <>
        {resetEmailSent ? (
          <div className="space-y-4">
            <div className="mb-6 rounded-lg bg-green-500/10 p-4 text-sm text-green-400">
              If an account exists with this email, you will receive password reset instructions shortly.
            </div>
            <form className="space-y-6" onSubmit={handleNewPasswordSubmit}>
              <div>
                <label htmlFor="email-readonly" className="block text-sm font-medium text-gray-200 mb-2">
                  Email address
                </label>
                <input
                  id="email-readonly"
                  type="email"
                  readOnly
                  value={email}
                  className="w-full bg-[#1A1A1A] border border-[#242424] rounded-lg px-4 py-2 text-gray-400 focus:outline-none transition-all duration-200"
                />
              </div>
              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-gray-200 mb-2">
                  Enter PIN from Email
                </label>
                <input
                  id="pin"
                  name="pin"
                  type="text"
                  required
                  className="w-full bg-[#0E0E0E] border border-[#242424] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300 transition-all duration-200"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="Enter 6-digit PIN"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                  Set new password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full bg-[#0E0E0E] border border-[#242424] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300 transition-all duration-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-4 w-full">
                <button
                  type="submit"
                  className="w-full text-center bg-purple-300 text-black rounded-lg px-4 py-2 font-medium hover:bg-purple-400 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-300/20 transition-all duration-200 box-border"
                >
                  Reset Password
                </button>
              </div>

            </form>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-4 w-full">
              <button
                type="submit"
                className="w-full text-center bg-purple-300 text-black rounded-lg px-4 py-2 font-medium hover:bg-purple-400 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-300/20 transition-all duration-200 box-border"
              >
                Send Reset Instructions
              </button>
            </div>
          </form>
        )}
      </>
      <div className="mt-6 text-center">
        <button
          type="button"
          className="text-purple-300 hover:text-purple-400 transition-colors text-sm"
          onClick={onBack}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}