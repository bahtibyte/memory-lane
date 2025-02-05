import { useState } from "react";
import GoogleSSOForm from "./misc/GoogleSSOForm";
import OrDivider from "./misc/OrDivider";
import { useAuth } from "@/core/context/auth-provider";
import { InitiateAuthCommandOutput } from "@aws-sdk/client-cognito-identity-provider";

interface LoginAccountProps {
  onSignup: () => void;
  onForgotPassword: () => void;
  onVerifyAccount: (email: string, password: string) => void;
  onSuccess: (response: InitiateAuthCommandOutput) => void;
}

export default function LoginAccount({ onSuccess, onSignup, onForgotPassword, onVerifyAccount }: LoginAccountProps) {

  const { login } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    try {
      const response = await login(email, password);
      console.log("login response: ", response);
      if (response) {
        onSuccess(response);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.name === "UserNotConfirmedException") {
        onVerifyAccount(email, password);
      } else {
        console.log("error from login: ", err);
        setError(err.message || 'An error occurred during login');
      }
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Login to your account
        </h2>
        <p className="text-gray-400 text-sm md:text-base mt-2">
          Welcome back! Please enter your details
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
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full bg-[#0E0E0E] border border-[#242424] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300 transition-all duration-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
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
            className="w-full text-center bg-purple-300 text-black rounded-lg px-4 py-2 font-medium hover:bg-purple-400 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-300/20 transition-all duration-200 box-border"
          >
            Login
          </button>
        </div>

      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          className="text-purple-300 hover:text-purple-400 transition-colors text-sm"
          onClick={onSignup}
        >
          Don&apos;t have an account? Sign up
        </button>
      </div>
    </div>
  );
}