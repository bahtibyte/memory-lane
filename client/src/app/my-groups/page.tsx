"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/core/context/auth-provider";
import { Routes } from "@/core/utils/routes";
import { useRouter } from "next/navigation";
import SignOutButton from "@/core/components/SignOutButton";
import Image from "next/image";
import LoadingScreen from "@/core/components/Loading";
import { createGroup, getOwnedGroups } from '@/core/utils/api';
import { GroupData } from "@/core/utils/types";



export default function MyGroups() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ group_name: '' });
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newGroup, setNewGroup] = useState<{ name: string; url: string } | null>(null);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [activeOptionsMenu, setActiveOptionsMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("isAuthenticated is false, pushing to authentication");
      router.push(Routes.AUTHENTICATION);
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchGroups = async () => {
      const response = await getOwnedGroups();
      if (response && response.groups) {
        setGroups(response.groups);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveOptionsMenu(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleOptionsMenu = (groupId: string) => {
    setActiveOptionsMenu(activeOptionsMenu === groupId ? null : groupId);
  };

  if (isLoading || !isAuthenticated) {
    return <LoadingScreen />;
  }

  console.log("groups: ", groups);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsCreating(true);

    try {
      const response = await createGroup(formData);

      if (response) {
        setNewGroup({
          name: response.result.group_name,
          url: response.result.group_url,
        });
        setShowCreateForm(false);
        setFormData({ group_name: '' });
      } else {
        throw new Error('Failed to create group');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  function handleDeleteGroup(group: GroupData) {
    console.log("deleting group: ", group);
  }

  function handleEditGroup(group: GroupData) {
    console.log("editing group: ", group);
    router.push(`/${group.uuid}/edit-group`);
  }

  return (
    <div className="min-h-screen bg-[#0E0E0E]">
      {/* Header - Made more compact on mobile */}
      <div className="w-full border-b border-[#242424]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-purple-300 font-medium text-sm sm:text-base">{user?.profile_name.toUpperCase()}</div>
          <SignOutButton />
        </div>
      </div>

      {/* Main content - Adjusted padding for mobile */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">My Groups</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-purple-300 text-black px-4 sm:px-6 py-2 rounded-lg hover:bg-purple-400 transition-colors text-sm sm:text-base"
          >
            Create Group
          </button>
        </div>

        {/* Groups Grid - Adjusted for better mobile layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {groups.map((group) => (
            <div 
              key={group.uuid} 
              className="bg-[#1A1A1A] border border-[#242424] rounded-lg overflow-hidden hover:border-purple-300/30 transition-colors"
            >
              {/* Thumbnail Image - Adjusted height for mobile */}
              <div className="relative w-full h-36 sm:h-48">
                <Image
                  src={/*group.thumbnail_url ||*/ "/default-group.png"}
                  alt={group.group_name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] to-transparent opacity-60" />
              </div>

              {/* Group Info - Adjusted padding and text sizes */}
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-lg sm:text-xl font-semibold text-white">{group.group_name}</h2>
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => toggleOptionsMenu(group.uuid)}
                      className="p-1 hover:bg-[#242424] rounded-full transition-colors"
                    >
                       <Image 
                        src="/elipsis.png"
                        alt="Options"
                        width={20}
                        height={20}
                        className="text-purple-300 sm:w-6 sm:h-6"
                      />
                    </button>
                    
                    {activeOptionsMenu === group.uuid && (
                      <div className="absolute right-0 bottom-full mb-2 w-40 sm:w-48 bg-[#242424] rounded-lg shadow-lg overflow-hidden">
                        <button
                          onClick={() => handleEditGroup(group)}
                          className="w-full text-left px-3 sm:px-4 py-2 text-sm sm:text-base text-white hover:bg-[#1A1A1A] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group)}
                          className="w-full text-left px-3 sm:px-4 py-2 text-sm sm:text-base text-red-400 hover:bg-[#1A1A1A] transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <a
                  href={`/${group.uuid}`}
                  className="inline-block w-full text-center bg-[#242424] text-purple-300 px-3 sm:px-4 py-2 rounded-lg hover:bg-[#2A2A2A] transition-colors mt-3 sm:mt-4 text-sm sm:text-base"
                >
                  View Timeline
                </a>
              </div>
            </div>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-400 text-sm sm:text-base">No groups created yet. Create your first group to get started!</p>
          </div>
        )}

        {/* Create Group Modal - Made more mobile-friendly */}
        {showCreateForm && (
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
                  <label htmlFor="group_name" className="block text-sm font-medium text-purple-300 mb-2">
                    Group Name
                  </label>
                  <input
                    type="text"
                    id="group_name"
                    value={formData.group_name}
                    onChange={(e) => setFormData({ group_name: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 bg-[#0E0E0E] border border-[#242424] rounded-lg text-white focus:outline-none focus:border-purple-300 text-sm sm:text-base"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
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
        )}

        {/* Success Message - Adjusted for mobile */}
        {newGroup && (
          <div className="fixed bottom-4 right-4 left-4 sm:left-auto bg-green-500/10 border border-green-500 text-green-500 p-4 rounded-lg shadow-lg text-sm sm:text-base">
            <p className="font-medium">Group created successfully!</p>
            <button
              onClick={() => setNewGroup(null)}
              className="text-sm text-green-400 hover:text-green-300 mt-2"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
