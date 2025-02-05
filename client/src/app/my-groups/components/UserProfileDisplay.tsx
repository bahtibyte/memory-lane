import { User } from "@/core/utils/types";
import Image from "next/image";
import PencilIcon from "@/app/shared/icons/PencilIcon";

interface UserProfileDisplayProps {
  user: User | null;
  onEdit: (show: boolean) => void;
}

export default function UserProfileDisplay({ user, onEdit }: UserProfileDisplayProps) {

  const getInitialLetter = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getRandomPastelColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 85%)`;
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="relative group">
          <div
            className="relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0"
            style={{
              backgroundColor: getRandomPastelColor(user?.profile_name || ''),
              color: '#1A1A1A'
            }}
          >
            {user?.profile_url ? (
              <Image
                src={user.profile_url}
                alt={user.profile_name}
                fill
                sizes="32px"
                className="object-cover rounded-full"
              />
            ) : (
              getInitialLetter(user?.profile_name || '')
            )}
          </div>
        </div>
        <div className="text-purple-300 font-medium text-sm sm:text-base relative flex items-center">
          
          {user?.profile_name.toUpperCase()}
          
          <button
            onClick={() => onEdit(true)}
            className="ml-2 p-1 bg-purple-300 rounded-full hover:bg-purple-400 transition-colors"
          >
            <PencilIcon />
          </button>
        </div>

      </div>
    </div>
  );
}