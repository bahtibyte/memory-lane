interface SignOutButtonProps {
  onSignOut: () => void;
}

export default function SignOutButton({ onSignOut }: SignOutButtonProps) {
  return (
    <button
      onClick={onSignOut}
      className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
    >
      Sign Out
    </button>
  );
}