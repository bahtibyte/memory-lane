import Image from "next/image";
import { GroupData } from "@/core/utils/types";
import { useRouter } from "next/navigation";
import { deleteGroup } from "@/core/utils/api";

interface GroupCardProps {
  group: GroupData;
  activeOptionsMenu: string | null;
  menuRef: React.RefObject<HTMLDivElement | null>;
  toggleOptionsMenu: (groupUuid: string) => void;
  setActiveOptionsMenu: (groupUuid: string | null) => void;
  handleDeletedGroup: (group: GroupData) => void;
}

export default function GroupCard({ group, activeOptionsMenu, menuRef, toggleOptionsMenu, setActiveOptionsMenu, handleDeletedGroup }: GroupCardProps) {
  const router = useRouter();

  function handleEditGroup(group: GroupData) {
    router.push(`/${group.uuid}/edit-group`);
  }

  async function handleDeleteGroup(group: GroupData) {
    if (!confirm(`Are you sure you want to delete "${group.group_name}"?`)) {
      return;
    }

    try {
      const response = await deleteGroup(group.uuid);
      if (response.group_data) {
        handleDeletedGroup(group);
      } else {
        throw new Error('Failed to delete group');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  }

  return (
    <div>
      <div
        key={group.uuid}
        className="bg-[#1A1A1A] border border-[#242424] rounded-lg overflow-hidden hover:border-purple-300/30 transition-colors"
      >
        {/* Thumbnail Image - Adjusted height for mobile */}
        <div className="relative w-full h-36 sm:h-48 bg-[#242424]">
          {group.thumbnail_url ? (
            <Image
              src={group.thumbnail_url}
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
                    Delete
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
    </div>
  );
}