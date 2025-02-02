'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { updateGroupName } from '@/core/utils/api';
import { MemoryLane } from '@/core/utils/types';

interface EditGroupNameProps {
  memoryId: string;
  initialGroupName: string;
  memoryLane: MemoryLane;
  setMemoryLane: (data: MemoryLane) => void;
  isAdmin: boolean;
}

export default function EditGroupName({
  memoryId,
  initialGroupName,
  memoryLane,
  setMemoryLane,
  isAdmin
}: EditGroupNameProps) {
  const router = useRouter();
  const [groupName, setGroupName] = useState(initialGroupName);
  const [showNameSuccess, setShowNameSuccess] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);


  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupName(e.target.value);
  };

  const handleEditClick = () => {
    setIsEditingName(true);
    // Use setTimeout to ensure the input is editable before focusing
    setTimeout(() => {
      inputRef.current?.focus();
      // Optional: Select all text for easy replacement
      inputRef.current?.select();
    }, 0);
  };

  const handleNameSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await updateGroupName({
        memory_id: memoryId,
        group_name: groupName
      });
      
      if (result.group_data) {
        setMemoryLane({
          group_data: result.group_data,
          photo_entries: memoryLane.photo_entries
        });
        setShowNameSuccess(true);
        setIsEditingName(false);
      }
      
      setTimeout(() => {
        setShowNameSuccess(false);
      }, 3000);

      router.refresh();
    } catch (error) {
      console.error('Error updating group name:', error);
    }
  };

  return (
    <div className="bg-[#1A1A1A] border border-[#242424] rounded-lg p-4 md:p-6 mb-6">
      <label className="block text-white font-medium mb-2">Group Name</label>
      <form onSubmit={handleNameSave} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={groupName}
            onChange={handleNameChange}
            className={`w-full bg-[#0E0E0E] border border-[#242424] rounded-lg px-4 py-2 text-white transition-all duration-200 ${
              isAdmin 
                ? 'focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300' 
                : 'cursor-not-allowed'
            }`}
            placeholder="Enter group name"
            readOnly={!isEditingName || !isAdmin}
          />
          {!isEditingName && isAdmin && (
            <button
              type="button"
              onClick={handleEditClick}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-purple-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
          {!isAdmin && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          )}
        </div>
        {isEditingName && isAdmin && (
          <button
            type="submit"
            className="px-6 py-2 bg-purple-300 text-black rounded-lg hover:bg-purple-400 hover:scale-105 hover:shadow-lg hover:shadow-purple-300/20 transition-all duration-200 whitespace-nowrap font-medium"
          >
            Save Name
          </button>
        )}
      </form>
      {showNameSuccess && (
        <div className="text-sm text-green-400 mt-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Group name updated successfully
        </div>
      )}
    </div>
  );
}
