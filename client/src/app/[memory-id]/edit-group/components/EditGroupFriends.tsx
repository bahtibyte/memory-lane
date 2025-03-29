'use client';

import { AppData, Friend } from '@/core/utils/types';
import DisplayFriend from './friends/DisplayFriend';
import AddFriends from './friends/AddFriends';

const friendsSorter = (a: Friend, b: Friend) => {
  // Owner comes first
  if (a.isOwner) return -1;
  if (b.isOwner) return 1;

  // Admins come second
  if (a.isAdmin && !b.isAdmin) return -1;
  if (!a.isAdmin && b.isAdmin) return 1;

  // Within admin group, sort by name
  if (a.isAdmin && b.isAdmin) {
    return a.profileName.localeCompare(b.profileName);
  }

  // Users without emails come last
  if (!a.email && b.email) return 1;
  if (a.email && !b.email) return -1;

  // For users with emails, confirmed come before unconfirmed
  if (!a.isConfirmed && b.isConfirmed) return 1;
  if (a.isConfirmed && !b.isConfirmed) return -1;

  // Sort by name within each group
  return a.profileName.localeCompare(b.profileName);
}

interface EditGroupFriendsProps {
  memoryId: string;
  appData: AppData;
  setAppData: (appData: AppData) => void;
}

export default function EditGroupFriends({ memoryId, appData, setAppData }: EditGroupFriendsProps) {

  const { user, friends } = appData;
  const self = friends.find(friend => friend.userId === user.userId);

  if (!self) {
    return null;
  }

  const sortedFriends = friends.sort(friendsSorter);

  const onFriendsAdded = (friends: Friend[]) => {
    if (!appData) return;
    setAppData({
      ...appData,
      friends: [...appData.friends, ...friends]
    });
  };

  const onFriendRemoved = (friend: Friend) => {
    if (!appData) return;
    setAppData({
      ...appData,
      friends: appData.friends.filter(f => f.friendId !== friend.friendId)
    });
  };

  const onAdminChange = (friend: Friend) => {
    if (!appData) return;
    setAppData({
      ...appData,
      friends: appData.friends.map(f => f.friendId === friend.friendId ? friend : f)
    });
  };

  const onEditFriend = (friend: Friend) => {
    if (!appData) return;
    setAppData({
      ...appData,
      friends: appData.friends.map(f => f.friendId === friend.friendId ? friend : f)
    });
  };

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
