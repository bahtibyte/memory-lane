"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/core/context/auth-provider";
import { Routes } from "@/core/utils/routes";
import { useRouter } from "next/navigation";
import SignOutButton from "@/app/components/SignOutButton";
import Image from "next/image";
import LoadingScreen from "@/app/components/Loading";
import { createGroup, deleteGroup, getOwnedGroups } from '@/core/utils/api';
import { GroupData } from "@/core/utils/types";
import { clearTokens } from "@/core/utils/tokens";

export default function MyGroups() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, setUser } = useAuth();
  const [isSignedOut, setIsSignedOut] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ group_name: '' });
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newGroup, setNewGroup] = useState<{ name: string; url: string; message?: string } | null>(null);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [activeOptionsMenu, setActiveOptionsMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSignedOut) {
      router.push(Routes.LANDING_PAGE);
    } else if (!isLoading && !isAuthenticated) {
      console.log("isAuthenticated is false, pushing to authentication");
      router.push(Routes.AUTHENTICATION_PAGE);
    }
  }, [isLoading, isAuthenticated, router, isSignedOut]);

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

    if (activeOptionsMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [activeOptionsMenu]);

  const toggleOptionsMenu = (groupId: string) => {
    setActiveOptionsMenu(activeOptionsMenu === groupId ? null : groupId);
  };

  if (isLoading || !isAuthenticated) {
    return <LoadingScreen />;
  }

  const handleSignOut = async () => {
    await clearTokens();
    setIsSignedOut(true);
    setUser(null);
  };

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
        setGroups([...groups, response.result]);
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

  async function handleDeleteGroup(group: GroupData) {
    if (!confirm(`Are you sure you want to delete "${group.group_name}"?`)) {
      return;
    }

    try {
      const response = await deleteGroup(group.uuid);
      if (response.group_data) {
        setGroups(groups.filter(g => g.uuid !== group.uuid));
        setNewGroup({ name: group.group_name, url: '', message: 'Group deleted successfully' });
      } else {
        throw new Error('Failed to delete group');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      setError('Failed to delete group. Please try again.');
    }
  }

  function handleEditGroup(group: GroupData) {
    router.push(`/${group.uuid}/edit-group`);
  }

  return (
    <div className="min-h-screen bg-[#0E0E0E]">
      {/* Header - Made more compact on mobile */}
      <div className="w-full border-b border-[#242424]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-purple-300 font-medium text-sm sm:text-base">{user?.profile_name.toUpperCase()}</div>
          <SignOutButton onSignOut={handleSignOut} />
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
              <div className="relative w-full h-36 sm:h-48 bg-[#242424]">
                {group.group_thumbnail ? (
                  <Image
                    src={group.group_thumbnail}
                    alt={group.group_name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-purple-300 text-xl font-medium">Memory Lane</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] to-transparent opacity-60" />
              </div>

              {/* Group Info - Adjusted padding and text sizes */}
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-lg sm:text-xl font-semibold text-white">{group.group_name}</h2>
                  <div className="relative" ref={activeOptionsMenu === group.uuid ? menuRef : null}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOptionsMenu(group.uuid);
                      }}
                      className="p-1 hover:bg-[#242424] rounded-full transition-colors text-gray-400 hover:text-purple-300"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    </button>

                    {activeOptionsMenu === group.uuid && (
                      <div className="absolute right-0 bottom-full mb-2 w-40 sm:w-48 bg-[#242424] rounded-lg shadow-lg overflow-hidden z-50">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditGroup(group);
                            setActiveOptionsMenu(null);
                          }}
                          className="w-full text-left px-3 sm:px-4 py-2 text-sm sm:text-base text-white hover:bg-[#1A1A1A] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGroup(group);
                            setActiveOptionsMenu(null);
                          }}
                          className="w-full text-left px-3 sm:px-4 py-2 text-sm sm:text-base text-red-400 hover:bg-[#1A1A1A] transition-colors"
                        >
                          Delete {group.group_name}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <a
                  href={`/${group.alias ? group.alias : group.uuid}`}
                  className="inline-block w-full text-center bg-[#242424] text-purple-300 px-3 sm:px-4 py-2 rounded-lg hover:bg-[#2A2A2A] transition-colors mt-3 sm:mt-4 text-sm sm:text-base"
                >
                  View Memory
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
            <p className="font-medium">{newGroup.message}</p>
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
