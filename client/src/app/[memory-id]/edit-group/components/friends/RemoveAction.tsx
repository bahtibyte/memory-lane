import { removeFriendFromGroup } from '@/core/utils/api';
import { Friend } from '@/core/utils/types';
import { useState } from 'react';

interface RemoveActionProps {
  memoryId: string;
  friend: Friend;
  onRemove: (friend: Friend) => void;
}

export default function RemoveAction({ memoryId, friend, onRemove }: RemoveActionProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRemoveButton, setShowRemoveButton] = useState(true);

  const handleInitialClick = () => {
    setShowConfirm(true);
    setShowRemoveButton(false);
    // Set a timeout to reset the state after 5 seconds
    setTimeout(() => {
      setShowConfirm(false);
      setShowRemoveButton(true);
    }, 5000);
  };

  const handleRemove = async () => {
    const response = await removeFriendFromGroup({
      memory_id: memoryId,
      friend_id: friend.friend_id,
    });
    console.log('remove response', response);
    if (response && response.friend) {
      onRemove(response.friend);
    }
    setShowConfirm(false);
    setShowRemoveButton(true);
  }

  if (friend.is_admin) {
    return null;
  }

  return (
    <div className="relative">
      {showRemoveButton && (
        <button
          onClick={handleInitialClick}
          className="flex flex-col items-center w-[60px] gap-1.5 text-xs font-medium text-white hover:text-red-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
          </svg>
          <span className="whitespace-nowrap">Remove</span>
        </button>
      )}

      {showConfirm && (
        <div className="flex flex-col items-center w-[120px] gap-1.5">
          <span className="text-sm text-white whitespace-nowrap">Are you sure?</span>
          <button
            onClick={handleRemove}
            className="px-2 py-1 text-xs font-medium text-red-400 border border-red-400 rounded hover:bg-red-400 hover:text-white transition-colors"
          >
            Confirm Remove
          </button>
        </div>
      )}
    </div>
  );
}