'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateGroupName } from '@/core/utils/api';
import { MemoryLane } from '@/core/utils/types';
import EditIcon from '../icons/EditIcon';

interface EditGroupNameProps {
  memoryId: string;
  initialGroupName: string;
  memoryLane: MemoryLane;
  setMemoryLane: (data: MemoryLane) => void;
}

export default function EditGroupName({
  memoryId,
  initialGroupName,
  memoryLane,
  setMemoryLane
}: EditGroupNameProps) {
  const router = useRouter();
  const [groupName, setGroupName] = useState(initialGroupName);
  const [showNameSuccess, setShowNameSuccess] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await updateGroupName({
        memory_id: memoryId,
        group_name: groupName
      });
      if (result.group_data) {
        if (memoryLane) {
          setMemoryLane({
            group_data: result.group_data,
            photo_entries: memoryLane.photo_entries
          });
        }
        setShowNameSuccess(true);
        setIsEditingName(false);
      }
      setTimeout(() => {
        setShowNameSuccess(false);
      }, 3000);

      router.refresh();
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  const handleEditClick = () => {
    setIsEditingName(true);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Group</h1>

      <form onSubmit={handleUpdateGroup} className="mb-8">
        <div className="mb-4">
          <label htmlFor="groupName" className="block mb-2">Group Name:</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="border p-2 rounded w-full max-w-md text-black"
              readOnly={!isEditingName}
              style={{ backgroundColor: !isEditingName ? '#f3f4f6' : 'white' }}
            />
            {!isEditingName ? (
              <button
                type="button"
                onClick={handleEditClick}
                className="p-2 text-blue-500 hover:text-blue-600"
              >
                <EditIcon />
              </button>
            ) : null}
          </div>
        </div>
        {showNameSuccess && (
          <div className="text-sm text-green-500 mb-4">
            ✓ Group name has been updated successfully
          </div>
        )}
        {isEditingName && (
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save Name
          </button>
        )}
      </form>
    </div>
  );
}
