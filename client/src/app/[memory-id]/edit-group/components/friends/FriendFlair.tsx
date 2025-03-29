import { Friend } from '@/core/utils/types';

interface FriendFlairProps {
  friend: Friend;
}

export default function FriendFlair({ friend }: FriendFlairProps) {
  const owner = friend.isOwner;
  const admin = friend.isAdmin;
  const member = !owner && !admin && friend.isConfirmed;
  const unconfirmed = !friend.isConfirmed;

  return (
    <div>
      {owner && (
        <span className="px-2 py-0.5 bg-yellow-300/10 text-yellow-300 rounded text-xs font-medium">
          Owner
        </span>
      )}
      {admin && (
        <span className="px-2 py-0.5 bg-purple-300/10 text-purple-300 rounded text-xs font-medium">
          Admin
        </span>
      )}
      {member && (
        <span className="px-2 py-0.5 bg-green-300/10 text-green-300 rounded text-xs font-medium">
          Friend
        </span>
      )}
      {unconfirmed && (
        <span className="px-2 py-0.5 bg-gray-300/10 text-gray-300 rounded text-xs font-medium">
          Unconfirmed
        </span>
      )}
    </div>
  );
}