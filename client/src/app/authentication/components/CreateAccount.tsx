/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import GoogleSSOForm from "./misc/GoogleSSOForm";
import { useAuth } from "@/core/context/auth-provider";
import OrDivider from "./misc/OrDivider";

interface CreateAccountProps {
  onLogin: () => void;
  onSuccess: (email: string, password: string) => void;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CreateAccount({ onLogin, onSuccess, showPassword, setShowPassword }: CreateAccountProps) {
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await signUp(name, email, password);
      if (!response) {
        setError('Signup failed. Please try again.');
      } else if (response.UserConfirmed === false) {
        onSuccess(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Create your account
        </h2>
        <p className="text-gray-400 text-sm md:text-base mt-2">
          Get started by creating your account
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <GoogleSSOForm />

        <OrDivider />

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required={true}
            className="w-full bg-[#0E0E0E] border border-[#242424] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300 transition-all duration-200"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

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
          <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2 flex items-center gap-2">
            Password
            <div className="relative group">
              <svg className="w-[17px] h-[17px] text-gray-400 hover:text-purple-300 transition-colors cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-[#1A1A1A] border border-[#333333] rounded-lg text-xs text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <p className="mb-2">Password requirements:</p>
                <ul className="space-y-1 list-disc pl-4">
                  <li>Minimum 6 characters</li>
                  <li>At least one number</li>
                  <li>At least one uppercase letter</li>
                  <li>At least one lowercase letter</li>
                </ul>
                <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-[#1A1A1A] border-r border-b border-[#333333] transform rotate-45"></div>
              </div>
            </div>
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
        </div>

        <div className="w-full">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-center bg-purple-300 text-black rounded-lg px-4 py-2 font-medium hover:bg-purple-400 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-300/20 transition-all duration-200 box-border disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>
      </form>
      <div className="mt-6 text-center">
        <button
          type="button"
          disabled={isLoading}
          className="text-purple-300 hover:text-purple-400 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onLogin}
        >
          {'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
}
