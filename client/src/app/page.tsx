import Image from 'next/image';
import { DUMMY_DATA } from './data';

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function getDaysAgo(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} days ago`;
}

export default function Home() {
  return (
    <div className="min-h-screen p-8 bg-[rgb(30,30,30)]">
      <div className="max-w-[1000px] mx-auto">
        {/* Group Name Header */}
        <h1 className="text-[32px] md:text-[50px] font-bold mb-8">{DUMMY_DATA.group}</h1>

        {/* Stats Container */}
        <div className="pb-16">
          <div className="flex">
            <div className="text-left">
              <p className="text-[24px] md:text-[36px] font-bold text-[#CCC7F8]">{DUMMY_DATA.photos_count}</p>
              <p className="text-white text-[16px] md:text-[24px]">Photos</p>
            </div>
            <div className="text-left ml-20">
              <p className="text-[24px] md:text-[36px] font-bold text-[#CCC7F8]">{DUMMY_DATA.friends_count}</p>
              <p className="text-white text-[16px] md:text-[24px]">Friends</p>
            </div>
            <div className="text-left ml-20">
              <p className="text-[24px] md:text-[36px] font-bold text-[#CCC7F8]">{DUMMY_DATA.years_count}</p>
              <p className="text-white text-[16px] md:text-[24px]">Years</p>
            </div>
            <div className="text-left ml-20">
              <p className="text-[24px] md:text-[36px] font-bold text-[#CCC7F8]">{DUMMY_DATA.months_count}</p>
              <p className="text-white text-[16px] md:text-[24px]">Months</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          {DUMMY_DATA.photo_entries.map((entry, index) => (
            <div key={index} className="flex gap-8 items-center pb-12">
              {/* Date and Caption */}
              <div className="w-48 text-right">
                <p className="text-[14px] md:text-[16px] font-semibold text-[#CCC7F8]">{formatDate(entry.photo_date)}</p>
                <p className="text-white mt-2 text-[18px] md:text-[24px]">{entry.photo_title}</p>
              </div>

              {/* Photo and Caption Container */}
              <div className="flex-1">
                {/* Photo */}
                <div className="relative aspect-video">
                  <Image
                    src={entry.photo_url}
                    alt={entry.photo_title}
                    fill
                    className="rounded-md shadow-md object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                {/* Photo Caption */}
                <p className="text-white mt-2 text-[14px] md:text-[16px]">{entry.photo_caption}</p>
                <p className="text-gray-400 text-[12px] md:text-sm mt-1">{getDaysAgo(entry.photo_date)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}