import { PhotoIcon, PencilSquareIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Photo } from '@/core/utils/types';
import Link from 'next/link';
import { HomeIcon } from '../shared/icons/HomeIcon';

function getYearsSpan(dates: string[]) {
  if (dates.length === 0) return "0";
  try {
    // Find oldest date
    const timestamps = dates.map(date => new Date(date).getTime());
    const oldestDate = new Date(Math.min(...timestamps));
    const today = new Date();

    // Check if date is valid
    if (isNaN(oldestDate.getTime())) return "0";

    // Calculate difference in years from oldest date to today
    const diffYears = (today.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    const fixedYears = Math.max(0, diffYears).toFixed(1);
    return fixedYears == "1.0" ? "1" : fixedYears;
  } catch (error) {
    console.error('Error calculating years span:', error);
    return "0";
  }
}

interface StatsContainerProps {
  photos: Photo[];
  friendsCount: number;
  groupName: string;
  isAuthorized: boolean;
  memoryId: string;
}

export function StatsContainer({ photos, friendsCount, groupName, isAuthorized, memoryId }: StatsContainerProps) {
  const yearsSpan = getYearsSpan(photos.map(photo => photo.photoDate));
  const photoCount = photos.length;

  return (
    <div className="mb-16 mt-5 md:mb-20 md:mt-8">

      {/* Header with Group Name and Action Buttons */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <Link
            href={isAuthorized ? "/my-groups" : "/"}
            className="px-2 md:px-3 py-2 border border-purple-300 text-purple-300 rounded hover:bg-purple-300 hover:text-black transition-colors flex items-center gap-2"
          >
            <HomeIcon className="w-4 h-4 md:w-5 md:h-5" />
            <span>Home</span>
          </Link>
        </div>
        
        <div className="flex justify-end gap-2 md:gap-4 flex-shrink-0">
          {isAuthorized ? (
            <>
              <Link
                href={`/${memoryId}/upload-photo`}
                className="px-2 md:px-4 py-2 bg-purple-300 text-black rounded hover:bg-purple-400 transition-colors text-sm md:text-base whitespace-nowrap flex items-center gap-2"
              >
                <PhotoIcon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="sm:hidden">Upload</span>
                <span className="hidden sm:inline">Upload Photo</span>
              </Link>
              <Link
                href={`/${memoryId}/edit-group`}
                className="px-2 md:px-4 py-2 border border-purple-300 text-purple-300 rounded hover:bg-purple-300 hover:text-black transition-colors text-sm md:text-base whitespace-nowrap flex items-center gap-2"
              >
                <PencilSquareIcon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="sm:hidden">Edit</span>
                <span className="hidden sm:inline">Edit Group</span>
              </Link>
            </>
          ) : (
            <>
              <span className="px-2 md:px-4 py-2 bg-gray-500 text-gray-300 rounded cursor-not-allowed text-sm md:text-base relative group whitespace-nowrap flex items-center gap-2">
                <PhotoIcon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="sm:hidden">Upload</span>
                <span className="hidden sm:inline">Upload Photo</span>
                <span className="invisible group-hover:visible absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-sm rounded whitespace-nowrap">
                  Not signed in or admin of this group
                </span>
              </span>
              <span className="px-2 md:px-4 py-2 border border-gray-500 text-gray-500 rounded cursor-not-allowed text-sm md:text-base relative group whitespace-nowrap flex items-center gap-2">
                <PencilSquareIcon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="sm:hidden">Edit</span>
                <span className="hidden sm:inline">Edit Group</span>
                <span className="invisible group-hover:visible absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-sm rounded whitespace-nowrap">
                  Not signed in or admin of this group
                </span>
              </span>
            </>
          )}
        </div>
      </div>

      <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#242424]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          
          <div className="lg:pl-6 lg:w-fit">
            <h1 className="text-[32px] md:text-[42px] font-bold text-white leading-tight">{groupName}</h1>
          </div>

          <div className="grid grid-cols-3 gap-6 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-300/10 rounded-lg p-3">
                <PhotoIcon className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <p className="text-[18px] sm:text-[20px] md:text-[24px] font-bold text-white">{photoCount}</p>
                <p className="text-[12px] sm:text-[13px] md:text-[14px] text-gray-400">Photos</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-purple-300/10 rounded-lg p-3">
                <UserGroupIcon className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <p className="text-[18px] sm:text-[20px] md:text-[24px] font-bold text-white">{friendsCount}</p>
                <p className="text-[12px] sm:text-[13px] md:text-[14px] text-gray-400">Friends</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-purple-300/10 rounded-lg p-3">
                <ClockIcon className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <p className="text-[18px] sm:text-[20px] md:text-[24px] font-bold text-white">{yearsSpan}</p>
                <p className="text-[12px] sm:text-[13px] md:text-[14px] text-gray-400">
                  {yearsSpan === "1" ? "Year" : "Years"}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
} 