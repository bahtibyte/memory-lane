"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/core/context/auth-provider";
import { Routes } from "@/core/utils/routes";
import { useRouter } from "next/navigation";
import SignOutButton from "@/app/components/SignOutButton";
import LoadingScreen from "@/app/components/Loading";
import { getOwnedGroups } from '@/core/utils/api';
import { GroupData } from "@/core/utils/types";
import { clearTokens } from "@/core/utils/tokens";
import UserProfileDisplay from "../components/my-groups/UserProfileDisplay";
import EditUserProfile from "../components/my-groups/EditUserModal";
import CreateGroupModal from "../components/my-groups/CreateGroupModal";
import GroupCard from "../components/my-groups/GroupCard";

export default function MyGroups() {
  const router = useRouter();

  const { user, isLoading, isAuthenticated, setUser } = useAuth();
  const [groups, setGroups] = useState<GroupData[]>([]);

  const [isSignedOut, setIsSignedOut] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [activeOptionsMenu, setActiveOptionsMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSignedOut) {
      router.push(Routes.LANDING_PAGE);
    } else if (!isLoading && !isAuthenticated) {
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

  const handleSignOut = async () => {
    await clearTokens();
    setIsSignedOut(true);
    setUser(null);
    setGroups([]);
  };

  const handleDeletedGroup = (group: GroupData) => {
    setGroups(groups.filter(g => g.uuid !== group.uuid));
  };

  if (isLoading || !isAuthenticated) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#0E0E0E]">
      {/* Header - Made more compact on mobile */}
      <div className="w-full border-b border-[#242424]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <UserProfileDisplay user={user} onEdit={setShowEditProfile} />
          <SignOutButton onSignOut={handleSignOut} />
        </div>
      </div>

      {/* Main content - Adjusted padding for mobile */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">My Groups</h1>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="bg-purple-300 text-black px-4 sm:px-6 py-2 rounded-lg hover:bg-purple-400 transition-colors text-sm sm:text-base"
          >
            Create Group
          </button>
        </div>

        {/* Groups Grid - Adjusted for better mobile layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {groups.map((group) => (
            <GroupCard
              key={group.uuid}
              group={group}
              activeOptionsMenu={activeOptionsMenu}
              menuRef={menuRef}
              toggleOptionsMenu={toggleOptionsMenu}
              setActiveOptionsMenu={setActiveOptionsMenu}
              handleDeletedGroup={handleDeletedGroup}
            />
          ))}
        </div>

        {groups.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-400 text-sm sm:text-base">
              No groups created yet. Create your first group to get started!
            </p>
          </div>
        )}

        {/* Create Group Modal - Made more mobile-friendly */}
        {showCreateGroup && (
          <CreateGroupModal
            groups={groups}
            setGroups={setGroups}
            setShowCreateGroup={setShowCreateGroup}
          />
        )}

        {/* Add the Profile Edit Modal */}
        {showEditProfile && (
          <EditUserProfile
            user={user}
            setUser={setUser}
            onClose={() => setShowEditProfile(false)}
          />
        )}
      </div>
    </div>
  );
}
