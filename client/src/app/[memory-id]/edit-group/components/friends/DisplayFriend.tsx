import { Friend, User } from '@/core/utils/types';
import Image from "next/image";
import AdminAction from './AdminAction';
import RemoveAction from './RemoveAction';
import FriendFlair from './FriendFlair';

interface DisplayFriendProps {
  memoryId: string;
  user: User;
  friend: Friend;
  onRemove: (friend: Friend) => void;
  onAdminChange: (friend: Friend) => void;
}

export default function DisplayFriend({ memoryId, user, friend, onRemove, onAdminChange }: DisplayFriendProps) {
  const getInitialLetter = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getRandomPastelColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 85%)`;
  };

  const is_user_owner = friend.user_id === user.user_id;

  return (
    <div>
      <div className="flex items-center justify-between p-3 bg-[#242424] rounded-lg mb-2 group">
        <div className="flex items-center gap-3 min-w-0">
          {/* Profile Picture */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium shrink-0 relative"
            style={{
              backgroundColor: getRandomPastelColor(friend.profile_name),
              color: '#1A1A1A'
            }}
          >
            {friend.profile_url ? (
              <Image
                src={friend.profile_url}
                alt={friend.profile_name}
                fill
                className="object-cover rounded-full"
              />
            ) : (
              getInitialLetter(friend.profile_name)
            )}
          </div>

          {/* Profile Name */}
          <div className="min-w-0">
            {!friend.email ? (
              // When no email, show flair above name
              <>
                <div className="mb-1">
                  <FriendFlair friend={friend} />
                </div>
                <span className="text-white truncate">
                  {friend.profile_name}
                </span>
              </>
            ) : (
              // When email exists, show flair next to name
              <>
                <div className="flex items-center gap-2">
                  <span className="text-white truncate">
                    {friend.profile_name}
                  </span>
                  <FriendFlair friend={friend} />
                </div>
                <div className="text-gray-400 text-sm truncate">
                  {friend.email}
                </div>
              </>
            )}
          </div>
        </div>


        {!is_user_owner && (
          <div className="flex items-start gap-8">
            <RemoveAction
              memoryId={memoryId}
              friend={friend}
              onRemove={onRemove}
            />
            <AdminAction
              memory_id={memoryId}
              friend={friend}
              onAdminChange={onAdminChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

