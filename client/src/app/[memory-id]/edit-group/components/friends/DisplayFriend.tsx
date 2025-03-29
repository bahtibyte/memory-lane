import { Friend, User } from '@/core/utils/types';
import Image from "next/image";
import AdminAction from './AdminAction';
import RemoveAction from './RemoveAction';
import FriendFlair from './FriendFlair';
import { useState } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { updateFriendInfo } from '@/core/wrappers/api';

interface DisplayFriendProps {
  memoryId: string;
  user: User;
  self: Friend;
  friend: Friend;
  onRemove: (friend: Friend) => void;
  onAdminChange: (friend: Friend) => void;
  onEditFriend: (friend: Friend) => void;
}

export default function DisplayFriend({ memoryId, user, self, friend, onRemove, onAdminChange, onEditFriend }: DisplayFriendProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(friend.profileName);
  const [tempEmail, setTempEmail] = useState(friend.email ?? '');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

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

  const isUserOwner = friend.userId === user.userId;

  const validateForm = () => {
    const newErrors: { name?: string; email?: string } = {};
    
    // Name validation
    if (!tempName.trim() || tempName.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    // Email validation (only if email is not empty)
    if (tempEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(tempEmail)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const { data } = await updateFriendInfo(memoryId, friend.friendId, tempName, tempEmail);

    if (data.error) {
      setErrors({ email: data.error });
      return;
    }

    if (data) {
      onEditFriend(data.friend);
      setIsEditing(false);
      setErrors({});
    }
  };

  const handleCancel = () => {
    setTempName(friend.profileName);
    setTempEmail(friend.email ?? '');
    setIsEditing(false);
    setErrors({});
  };

  return (
    <div>
      <div className="flex items-center justify-between p-3 bg-[#242424] rounded-lg mb-2 group">
        <div className="flex items-center gap-3 min-w-0">
          {/* Profile Picture */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium shrink-0 relative"
            style={{
              backgroundColor: getRandomPastelColor(friend.profileName),
              color: '#1A1A1A'
            }}
          >
            {friend.profileUrl ? (
              <Image
                src={friend.profileUrl}
                alt={friend.profileName}
                fill
                sizes="40px"
                className="object-cover rounded-full"
              />
            ) : (
              getInitialLetter(friend.profileName)
            )}
          </div>

          {/* Profile Name */}
          <div className="min-w-0">
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <div className="flex flex-col">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className={`bg-[#1A1A1A] text-white text-sm px-2 py-1 rounded w-32 ${
                        errors.name ? 'border border-red-500' : ''
                      }`}
                      placeholder="Name"
                    />
                    {errors.name && (
                      <span className="text-red-500 text-xs mt-1">{errors.name}</span>
                    )}
                  </div>
                  <div className="flex flex-col flex-1">
                    <input
                      type="email"
                      value={tempEmail}
                      onChange={(e) => setTempEmail(e.target.value)}
                      className={`bg-[#1A1A1A] text-gray-400 text-sm px-2 py-1 rounded w-full ${
                        errors.email ? 'border border-red-500' : ''
                      }`}
                      placeholder="Email"
                    />
                    {errors.email && (
                      <span className="text-red-500 text-xs mt-1">{errors.email}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 justify-start">
                  <button
                    onClick={handleSave}
                    className="text-green-500 hover:text-green-400 bg-[#1A1A1A] rounded px-2 py-1 text-xs flex items-center gap-1"
                  >
                    <CheckIcon className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="text-red-500 hover:text-red-400 bg-[#1A1A1A] rounded px-2 py-1 text-xs flex items-center gap-1"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white truncate">
                      {friend.profileName}
                    </span>
                    <FriendFlair friend={friend} />
                    {!friend.isConfirmed && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <PencilIcon className="w-4 h-4 text-gray-400 hover:text-white" />
                      </button>
                    )}
                  </div>
                  <div className="text-gray-400 text-sm truncate">
                    {friend.email}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {!isUserOwner && (
          <div className="flex items-start gap-8">
            <RemoveAction
              memoryId={memoryId}
              self={self}
              friend={friend}
              onRemove={onRemove}
            />
            <AdminAction
              memory_id={memoryId}
              self={self}
              friend={friend}
              onAdminChange={onAdminChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

