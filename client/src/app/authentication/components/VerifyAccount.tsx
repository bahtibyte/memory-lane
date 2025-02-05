import { useAuth } from "@/core/context/auth-provider";
import { InitiateAuthCommandOutput } from "@aws-sdk/client-cognito-identity-provider";
import { useState } from "react";

interface VerifyAccountProps {
  email: string;
  password: string;
  onSuccess: (response: InitiateAuthCommandOutput) => Promise<void>;
}

export default function VerifyAccount({ email, password, onSuccess }: VerifyAccountProps) {

  const { verify, login } = useAuth();

  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Verification code:', code);
    try {
      const response = await verify(email, code);
      console.log("verification response: ", response);
      if (!response) {
        setError('Verification failed. Please try again.');
      } else if (response.Session) {
        console.log("verification was good, doing internal login");
        // Verifiction was good, do a internal login here.
        const response = await login(email, password);
        console.log("verify login response: ", response);

        if (response) {
          await onSuccess(response);
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'An error occurred during verification');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Verify your account
        </h2>
        <p className="text-gray-400 text-sm md:text-base mt-2">
          Enter the verification code sent to your email
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

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
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
          />
        </div>

        <div className="w-full">
          <button
            type="submit"
            className="w-full text-center bg-purple-300 text-black rounded-lg px-4 py-2 font-medium hover:bg-purple-400 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-300/20 transition-all duration-200 box-border"
          >
            Verify Account
          </button>
        </div>
      </form>
    </div>
  );
}
