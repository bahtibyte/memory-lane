interface StatsContainerProps {
  photoCount: number;
  friendsCount: number;
  yearsSpan: string;
}

export function StatsContainer({ photoCount, friendsCount, yearsSpan }: StatsContainerProps) {
  return (
    <div className="pb-16">
      <div className="flex flex-wrap gap-8">
        <div className="text-left">
          <p className="text-[20px] sm:text-[24px] md:text-[36px] font-bold text-[#CCC7F8]">{photoCount}</p>
          <p className="text-white text-[14px] sm:text-[16px] md:text-[24px]">Photos</p>
        </div>
        <div className="text-left">
          <p className="text-[20px] sm:text-[24px] md:text-[36px] font-bold text-[#CCC7F8]">{friendsCount}</p>
          <p className="text-white text-[14px] sm:text-[16px] md:text-[24px]">Friends</p>
        </div>
        <div className="text-left">
          <p className="text-[20px] sm:text-[24px] md:text-[36px] font-bold text-[#CCC7F8]">{yearsSpan}</p>
          <p className="text-white text-[14px] sm:text-[16px] md:text-[24px]">Years</p>
        </div>
      </div>
    </div>
  );
} 