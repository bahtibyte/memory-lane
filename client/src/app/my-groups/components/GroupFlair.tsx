import { GroupData } from '@/core/utils/types';

interface GroupFlairProps {
  group: GroupData;
}

export default function GroupFlair({ group }: GroupFlairProps) {
  return (
    <div>
      {group.is_owner && (
        <span className="px-2 py-0.5 bg-yellow-300/10 text-yellow-300 rounded text-xs font-medium">
          Owner
        </span>
      )}
      {group.is_admin && (
        <span className="px-2 py-0.5 bg-purple-300/10 text-purple-300 rounded text-xs font-medium">
          Admin
        </span>
      )}
      {group.is_friend && (
        <span className="px-2 py-0.5 bg-green-300/10 text-green-300 rounded text-xs font-medium">
          Friend
        </span>
      )}
    </div>
  );
}