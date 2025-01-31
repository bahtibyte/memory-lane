import { useAuth } from '../context/auth-provider';
import { clearTokens } from '../utils/tokens';

export default function SignOutButton() {
  const { setUser } = useAuth();

  const handleSignOut =async () => {
    await clearTokens();
    setUser(null);
  };

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
    >
      Sign Out
    </button>
  );
}