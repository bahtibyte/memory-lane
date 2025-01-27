'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTimeline } from '@/app/context/timeline-context';

export default function EditGroupPage() {
  const group_id = useParams()['group-id'] as string;
  const router = useRouter();
  
  const { 
    timelineData, 
    setTimelineData, 
    loading, 
    failedToLoad, 
    fetchData
  } = useTimeline();
  
  const [groupName, setGroupName] = useState('');

  useEffect(() => { fetchData(group_id); }, [group_id, fetchData]);

  useEffect(() => {
    if (timelineData) {
      setGroupName(timelineData.group_name);
    }
  }, [timelineData]);

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`/api/groups/${group_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: groupName }),
      });
      // Update the context with the new group name
      if (timelineData) {
        setTimelineData({
          ...timelineData,
          group_name: groupName
        });
      }
      router.refresh();
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
      });
      // Update the context by removing the deleted photo
      if (timelineData) {
        setTimelineData({
          ...timelineData,
          photo_entries: timelineData.photo_entries.filter((_, index) => index !== photoId)
        });
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-[rgb(30,30,30)] flex flex-col items-center justify-center">
        <h1 className="text-white text-2xl">Loading...</h1>
      </div>
    );
  }

  if (!group_id || failedToLoad) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-[rgb(30,30,30)] flex flex-col items-center justify-center">
        <h1 className="text-white text-2xl mb-4">Page not found</h1>
        <Link href="/" className="text-[#CCC7F8] hover:text-white underline">
          Go back to home page
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-[1000px] mx-auto">
      <Link
        href={`/${group_id}`}
        className="inline-block mb-4 text-blue-500 hover:text-blue-600"
      >
        ← Back to Group
      </Link>

      <h1 className="text-2xl font-bold mb-6">Edit Group</h1>

      <form onSubmit={handleUpdateGroup} className="mb-8">
        <div className="mb-4">
          <label htmlFor="groupName" className="block mb-2">Group Name:</label>
          <input
            type="text"
            id="groupName"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="border p-2 rounded w-full max-w-md text-black"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Update Group Name
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-4">Photos</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-black bg-white border">
          <thead>
            <tr>
              <th className="border p-2">Title</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Photo URL</th>
              <th className="border p-2">Edit</th>
              <th className="border p-2">Delete</th>
            </tr>
          </thead>
          <tbody>
            {timelineData?.photo_entries.map((photo, index) => (
              <tr key={index}>
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
                    href={`/${group_id}/edit-photo/todo`}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 inline-block"
                  >
                    Edit
                  </Link>
                </td>
                <td className="border p-2 text-center text-black">
                  <button
                    onClick={() => handleDeletePhoto(index)}
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
