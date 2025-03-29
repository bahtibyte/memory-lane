import { useState } from "react";
import { createGroup } from '@/core/wrappers/api';
import { Group } from "@/core/utils/types";
import { toast } from "react-hot-toast";

interface CreateGroupModalProps {
  groups: Group[];
  setGroups: (groups: Group[]) => void;
  setShowCreateGroup: (show: boolean) => void;
}

export default function CreateGroupModal({ groups, setGroups, setShowCreateGroup }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsCreating(true);

    const { data } = await createGroup(groupName);
    if (data && data.group) {
      toast.success('Group created successfully');
      setShowCreateGroup(false);
      setGroups([...groups, data.group]);
    } else {
      toast.error('Failed to create group');
      setError('Failed to create group');
    }

    setIsCreating(false);
  };

  return (
    <div>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-[#1A1A1A] p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Create New Group</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 text-red-500 rounded-lg text-sm sm:text-base">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="groupName" className="block text-sm font-medium text-purple-300 mb-2">
                Group Name
              </label>
              <input
                type="text"
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 bg-[#0E0E0E] border border-[#242424] rounded-lg text-white focus:outline-none focus:border-purple-300 text-sm sm:text-base"
                required
              />
            </div>
            <div className="flex gap-3 text-center">
              <button
                type="button"
                onClick={() => setShowCreateGroup(false)}
                className="flex-1 bg-[#242424] text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-[#2A2A2A] transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-purple-300 text-black py-2 px-3 sm:px-4 rounded-lg hover:bg-purple-400 transition-colors disabled:opacity-50 text-sm sm:text-base"
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}