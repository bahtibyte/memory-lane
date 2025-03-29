import { updateFriendAdminStatus } from '@/core/wrappers/api';
import { Friend } from '@/core/utils/types';

interface AdminActionProps {
  memory_id: string;
  self: Friend;
  friend: Friend;
  onAdminChange: (friend: Friend) => void;
}

export default function AdminAction({ memory_id, self, friend, onAdminChange }: AdminActionProps) {

  // I am owner.
  if (self.isOwner) {
    if (!friend.isConfirmed) return null;
  }
  // I am admin.
  else if (self.isAdmin) {
    return null;
  }
  // I am friend.
  else {
    return null;
  }

  const handleAdminClick = async (admin: boolean) => {
    const { data } = await updateFriendAdminStatus(memory_id, friend.friendId, admin);
    if (data) {
      onAdminChange(data.friend);
    }
  }

  return (
    <div>
      {!friend.isAdmin ? (
        <button
          onClick={() => handleAdminClick(true)}
          className="flex flex-col items-center w-[60px] gap-1.5 text-xs font-medium text-red-400 hover:text-red-500 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="whitespace-nowrap">Give Admin</span>
        </button>
      ) : (
        <button
          onClick={() => handleAdminClick(false)}
          className="flex flex-col items-center w-[60px] gap-1.5 text-xs font-medium text-red-400 hover:text-red-500 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="whitespace-nowrap">Unadmin</span>
        </button>
      )}
    </div>

  );
}