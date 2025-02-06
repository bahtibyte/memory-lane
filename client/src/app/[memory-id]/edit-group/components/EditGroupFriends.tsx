'use client';

import { Friend, User } from '@/core/utils/types';
import DisplayFriend from './friends/DisplayFriend';
import AddFriends from './friends/AddFriends';

interface EditGroupFriendsProps {
  memoryId: string;
  user: User;
  friends: Friend[];
  onFriendsAdded: (friends: Friend[]) => void;
  onFriendRemoved: (friend: Friend) => void;
  onAdminChange: (friend: Friend) => void;
  onEditFriend: (friend: Friend) => void;
}

export default function EditGroupFriends({ memoryId, user, friends, onFriendsAdded, onFriendRemoved, onAdminChange, onEditFriend }: EditGroupFriendsProps) {

  const self = friends.find(friend => friend.user_id === user.user_id);

  if (!self) {
    return null;
  }

  const sortedFriends = friends.sort((a, b) => {
    // Owner comes first
    if (a.is_owner) return -1;
    if (b.is_owner) return 1;

    // Admins come second
    if (a.is_admin && !b.is_admin) return -1;
    if (!a.is_admin && b.is_admin) return 1;

    // Within admin group, sort by name
    if (a.is_admin && b.is_admin) {
      return a.profile_name.localeCompare(b.profile_name);
    }

    // Users without emails come last
    if (!a.email && b.email) return 1;
    if (a.email && !b.email) return -1;

    // For users with emails, confirmed come before unconfirmed
    if (!a.is_confirmed && b.is_confirmed) return 1;
    if (a.is_confirmed && !b.is_confirmed) return -1;

    // Sort by name within each group
    return a.profile_name.localeCompare(b.profile_name);
  });

  return (
    <div className="bg-[#1A1A1A] border border-[#242424] rounded-lg p-4 md:p-6 mb-6">
      <h2 className="text-white font-medium mb-4">Friends</h2>
      {/* Add New Friend Row */}
      <AddFriends
        memoryId={memoryId}
        onFriendsAdded={onFriendsAdded}
      />

      {/* Friend List */}
      {sortedFriends.map((friend, index) => (
        <DisplayFriend
          memoryId={memoryId}
          user={user}
          self={self}
          friend={friend}
          key={index}
          onRemove={onFriendRemoved}
          onAdminChange={onAdminChange}
          onEditFriend={onEditFriend}
        />
      ))}
    </div>
  );
}
