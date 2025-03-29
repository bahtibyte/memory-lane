"use client";

import { useEffect, useState, useRef } from "react";
import { Routes } from "@/core/utils/routes";
import { useRouter } from "next/navigation";
import SignOutButton from "@/app/shared/SignOutButton";
import LoadingScreen from "@/app/shared/Loading";
import { getGroups } from '@/core/wrappers/api';
import { Group, User } from "@/core/utils/types";
import { clearAuthenticationTokens } from "@/core/wrappers/tokens";
import UserProfileDisplay from "./components/UserProfileDisplay";
import EditUserProfile from "./components/EditUserModal";
import CreateGroupModal from "./components/CreateGroupModal";
import GroupCard from "./components/GroupCard";
import AccessDenied from "../shared/memory/AccessDenied";

/**
 * Sorts groups by role priority: owner -> admin -> friend
 */
function groupSorter(a: Group, b: Group) {
  if (a.isOwner && !b.isOwner) return -1;
  if (!a.isOwner && b.isOwner) return 1;
  if (a.isAdmin && !b.isAdmin) return -1;
  if (!a.isAdmin && b.isAdmin) return 1;
  if (a.isFriend && !b.isFriend) return -1;
  if (!a.isFriend && b.isFriend) return 1;
  return 0;
}

export default function MyGroups() {
  const router = useRouter();

  const [groups, setGroups] = useState<Group[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isSignedOut, setIsSignedOut] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [activeOptionsMenu, setActiveOptionsMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const sortedGroups = [...groups].sort(groupSorter);

  useEffect(() => {
    const fetchGroups = async () => {
      const { data, ok } = await getGroups();
      if (ok) {
        setGroups(data.groups);
        setUser(data.user);
      }
      setIsLoading(false);
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    if (isSignedOut) {
      router.push(Routes.LANDING_PAGE);
    } else if (!isLoading && !user) {
      router.push(Routes.AUTHENTICATION_PAGE);
    }
  }, [isLoading, router, isSignedOut, user]);

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
    await clearAuthenticationTokens();
    setIsSignedOut(true);
    setUser(null);
    setGroups([]);
  };

  const handleDeletedGroup = (group: Group) => {
    setGroups(groups.filter(g => g.uuid !== group.uuid));
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AccessDenied />
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
          {sortedGroups.map((group) => (
            <GroupCard
              key={group.uuid}
              group={group}
              user={user}
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
