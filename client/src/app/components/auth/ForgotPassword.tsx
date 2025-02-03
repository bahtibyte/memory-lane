import { useState } from "react";

interface ForgotPasswordProps {
  onLogin: () => void;
  onSuccess: () => void;
}

export default function ForgotPassword({ onLogin, onSuccess }: ForgotPasswordProps) {

  const [email, setEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    try {
      // TODO: Implement forgot password logic here
      console.log('Reset password for:', email);
      setResetEmailSent(true);
      await onSuccess();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'An error occurred while sending reset email');
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
          <div className="text-center space-y-4">
            <div className="mb-6 rounded-lg bg-green-500/10 p-4 text-sm text-green-400">
              If an account exists with this email, you will receive password reset instructions shortly.
            </div>
            <button
              type="button"
              onClick={() => {
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                onClick={onLogin}
                className="w-full bg-[#242424] text-white rounded-lg px-4 py-2 font-medium hover:bg-[#2A2A2A] transition-all duration-200"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}
      </>
    </div>
  );
}