import { MemoryLane } from "@/core/utils/types";
import Link from "next/link";

interface UploadFirstPhotoProps {
  memoryLane: MemoryLane;
  isAuthenticated: boolean;
  memory_id: string;
}

export default function UploadFirstPhoto({ memoryLane, isAuthenticated, memory_id }: UploadFirstPhotoProps) {
  return (
    <div className="min-h-screen bg-[#0E0E0E] p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-[#1A1A1A] border border-[#242424] rounded-lg p-8 text-center">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {memoryLane.group_data.group_name}
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Start your timeline by uploading the first photo
            </p>
          </div>

          {/* Upload Button Section */}
          <div className="space-y-6">
            {isAuthenticated ? (
              <Link
                href={`/${memory_id}/upload-photo`}
                className="w-full inline-block bg-purple-300 text-black rounded-lg px-4 py-3 font-medium hover:bg-purple-400 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-300/20 transition-all duration-200"
              >
                Upload First Photo
              </Link>
            ) : (
              <div className="relative">
                <button
                  disabled
                  className="w-full px-4 py-3 bg-[#242424] text-gray-400 rounded-lg cursor-not-allowed transition-all duration-200"
                >
                  Upload First Photo
                </button>
                <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-black text-white text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Not signed in
                </span>
              </div>
            )}

            {/* Back Button */}
            <Link
              href={isAuthenticated ? "/my-groups" : "/"}
              className="w-full inline-block border border-[#242424] text-gray-300 rounded-lg px-4 py-3 hover:bg-[#242424] transition-all duration-200"
            >
              Back to {isAuthenticated ? "My Groups" : "Home"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}