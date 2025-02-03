import { useMemoryLane } from "@/core/context/memory-provider";
import Link from "next/link";
import { useState } from "react";

interface PasswordProtectedProps {
  memory_id: string;
}

export default function PasswordProtected({ memory_id }: PasswordProtectedProps) {
  const { fetchData } = useMemoryLane();

  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');

    try {
      console.log("attempting passwcode, ", passcode);

      await fetchData(memory_id, passcode);

    } catch (error) {
      console.log("error verifying passcode", error);
      setPasscodeError('Failed to verify passcode');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0E0E0E]">
      <div className="w-full max-w-md px-4 md:px-8">
        <h1 className="text-white text-2xl mb-6 text-center">This memory lane is passcode protected</h1>

        <div className="w-full">
          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-2 rounded bg-[#1A1A1A] text-white border border-[#242424] focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              {passcodeError && (
                <p className="mt-2 text-red-400 text-sm">{passcodeError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full px-4 text-center py-2 bg-purple-300 text-black rounded hover:bg-purple-400 transition-colors box-border"
            >
              View memory lane
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/" className="text-purple-300 hover:text-purple-400 text-sm">
              Return to home page
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}