"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/core/context/auth-provider";
import { Routes } from "@/core/utils/routes";
import { useRouter } from "next/navigation";
import SignOutButton from "@/core/components/SignOutButton";
import Image from "next/image";
import LoadingScreen from "@/core/components/Loading";
import { createGroup } from '@/core/utils/api';

export default function MyGroups() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ group_name: '' });
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newGroup, setNewGroup] = useState<{ name: string; url: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      console.log("isAuthenticated is false, pushing to authentication");
      router.push(Routes.AUTHENTICATION);
    }
  }, [isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return <LoadingScreen />
  }

  console.log("user in my group: ", user);

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

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header with sign out button */}
      <div className="w-full bg-gray-800 shadow">
        <div className="max-w-[1000px] mx-auto px-4 py-4 flex justify-between items-center">
          <div></div> {/* Empty div for flex spacing */}
          <SignOutButton />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1000px] mx-auto px-4 py-8">
        <div className="text-center">
          {/* User information card */}
          <div className="bg-gray-800 p-6 rounded-lg shadow mb-8 inline-block">
            <div className="flex flex-col items-center gap-2">
              {user?.profile_url && (
                <div className="relative w-20 h-20">
                  <Image 
                    src={user.profile_url} 
                    alt="Profile" 
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
              )}
              <h2 className="text-xl font-semibold text-white">{user?.profile_name}</h2>
              <p className="text-gray-400">{user?.username}</p>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">My Groups</h1>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Create Group
            </button>
          </div>

          {/* Create Group Form Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-2xl font-bold text-white mb-4">Create New Group</h2>
                {error && (
                  <div className="mb-4 p-3 bg-red-900 text-red-200 rounded-md">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="group_name" className="block text-sm font-medium text-gray-300 mb-1">
                      Group Name
                    </label>
                    <input
                      type="text"
                      id="group_name"
                      value={formData.group_name}
                      onChange={(e) => setFormData({ group_name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md text-black"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                      disabled={isCreating}
                    >
                      {isCreating ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* New Group Success Message */}
          {newGroup && (
            <div className="mb-4 p-4 bg-green-900 text-green-200 rounded-md">
              <h2 className="text-xl mb-2">Group Created Successfully!</h2>
              <p className="mb-2">Your timeline for {newGroup.name} is accessible here:</p>
              <a
                href={newGroup.url}
                className="text-blue-400 hover:text-blue-300 underline block mb-4"
              >
                {newGroup.url}
              </a>
              <button
                onClick={() => setNewGroup(null)}
                className="text-sm text-gray-300 hover:text-white"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
