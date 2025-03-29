import { Group } from '@/core/utils/types';

interface GroupFlairProps {
  group: Group;
}

export default function GroupFlair({ group }: GroupFlairProps) {
  return (
    <div>
      {group.isOwner && (
        <span className="px-2 py-0.5 bg-yellow-300/10 text-yellow-300 rounded text-xs font-medium">
          Owner
        </span>
      )}
      {group.isAdmin && (
        <span className="px-2 py-0.5 bg-purple-300/10 text-purple-300 rounded text-xs font-medium">
          Admin
        </span>
      )}
      {group.isFriend && (
        <span className="px-2 py-0.5 bg-green-300/10 text-green-300 rounded text-xs font-medium">
          Friend
        </span>
      )}
    </div>
  );
}