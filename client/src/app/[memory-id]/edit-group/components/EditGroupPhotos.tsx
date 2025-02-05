import { deletePhoto } from "@/core/utils/api";
import { MemoryLane } from "@/core/utils/types";
import Link from "next/link";
import { PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";

interface EditGroupPhotosProps {
  memoryId: string;
  memoryLane: MemoryLane;
  setMemoryLane: (data: MemoryLane) => void;
}

export default function EditGroupPhotos({ memoryId, memoryLane, setMemoryLane }: EditGroupPhotosProps) {
  const handleDeletePhoto = async (photo_id: number) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const result = await deletePhoto(memoryId, photo_id);
      if (result.deleted_photo && memoryLane) {
        setMemoryLane({
          ...memoryLane,
          friends: memoryLane.friends
        });
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  return (
    <div className="bg-[#1A1A1A] border border-[#242424] rounded-lg p-6 mb-6">
      <h2 className="text-white font-medium mb-4">Photos</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-[#0E0E0E]">
            <tr className="text-center border-b border-[#242424]">
              <th className="p-4 text-sm font-medium text-gray-400 w-24">Date</th>
              <th className="p-4 text-sm font-medium text-gray-400 w-32">Title</th>
              <th className="p-4 text-sm font-medium text-gray-400 w-1/2">Caption</th>
              <th className="p-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {memoryLane?.photo_entries
              .sort((a, b) => new Date(b.photo_date).getTime() - new Date(a.photo_date).getTime())
              .map((photo, index) => (
                <tr 
                  key={index}
                  className="border-b border-[#242424] hover:bg-[#242424] transition-all duration-200 text-center"
                >
                  <td className="p-4 text-gray-300 whitespace-normal">
                    {photo.photo_date ? (
                      <>
                        <div>
                          {new Date(photo.photo_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(photo.photo_date).getFullYear()}
                        </div>
                      </>
                    ) : 'N/A'}
                  </td>
                  <td className="p-4 text-gray-300">
                    {photo.photo_title || ''}
                  </td>
                  <td className="p-4 text-gray-300">
                    {photo.photo_caption || ''}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-3">
                      <a
                        href={photo.photo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-[#0E0E0E] text-blue-300 rounded-lg hover:bg-[#2A2A2A] hover:text-blue-400 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200"
                        title="View photo"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </a>
                      <Link
                        href={`/${memoryId}/edit-photo/${photo.photo_id}`}
                        className="p-2 bg-[#0E0E0E] text-purple-300 rounded-lg hover:bg-[#2A2A2A] hover:text-purple-400 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200"
                        title="Edit photo"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeletePhoto(photo.photo_id)}
                        className="p-2 bg-[#0E0E0E] text-red-400 rounded-lg hover:bg-red-500 hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-200"
                        title="Delete photo"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {(!memoryLane?.photo_entries || memoryLane.photo_entries.length === 0) && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No photos have been added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}