import { deletePhoto } from "@/app/utils/api";
import { MemoryLane } from "@/app/utils/types";
import Link from "next/link";

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
      console.log('deletePhoto result', result);

      if (result.deleted_photo) {
        if (memoryLane) {
          setMemoryLane({
            group_data: memoryLane.group_data,
            photo_entries: memoryLane.photo_entries.filter((photo_entry) => photo_entry.photo_id !== result.deleted_photo.photo_id)
          });
        }
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Photos</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-black bg-white border">
          <thead>
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Title</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Photo URL</th>
              <th className="border p-2">Edit</th>
              <th className="border p-2">Delete</th>
            </tr>
          </thead>
          <tbody>
            {memoryLane?.photo_entries
              .sort((a, b) => new Date(b.photo_date).getTime() - new Date(a.photo_date).getTime())
              .map((photo, index) => (
                <tr key={index}>
                  <td className="border p-2 text-black">
                    {index + 1}
                  </td>
                  <td className="border p-2 whitespace-normal text-black">
                    {photo.photo_date ? new Date(photo.photo_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : 'N/A'}
                  </td>
                  <td className="border p-2 whitespace-normal text-black">
                    {photo.photo_title || 'Untitled'}
                  </td>
                  <td className="border p-2 whitespace-normal text-black">
                    {photo.photo_caption || 'No description'}
                  </td>
                  <td className="border p-2 text-black">
                    <a
                      href={photo.photo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View Photo
                    </a>
                  </td>
                  <td className="border p-2 text-center text-black">
                    <Link
                      href={`/${memoryId}/edit-photo/${photo.photo_id}`}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 inline-block"
                    >
                      Edit
                    </Link>
                  </td>
                  <td className="border p-2 text-center text-black">
                    <button
                      onClick={() => handleDeletePhoto(photo.photo_id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}