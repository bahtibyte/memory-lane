import { PhotoIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline';

interface StatsContainerProps {
  photoCount: number;
  friendsCount: number;
  yearsSpan: string;
  groupName: string;
}

export function StatsContainer({ photoCount, friendsCount, yearsSpan, groupName }: StatsContainerProps) {
  return (
    <div className="mb-16">
      <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#242424]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="lg:border-l lg:border-[#242424] lg:pl-6 lg:w-fit">
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