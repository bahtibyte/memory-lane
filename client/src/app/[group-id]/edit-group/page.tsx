'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DUMMY_DATA } from '@/app/data';
import { getTimeline } from '@/app/utils/api';


export default function EditGroupPage() {
  const group_id = useParams()['group-id'] as string;

  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [timelineData, setTimelineData] = useState(DUMMY_DATA);
  const [loading, setLoading] = useState(true);
  const [failedToLoad, setFailedToLoad] = useState(false);

  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        if (!group_id) {
          setFailedToLoad(true);
        } else if (group_id === 'demo') {
          setTimelineData(DUMMY_DATA);
          setGroupName(DUMMY_DATA.group_name);
        } else {
          console.log('Fetching timeline data for group:', group_id);
          const timeline = await getTimeline(group_id);
          if (!timeline) {
            console.log('Failed to fetch timeline data:', timeline);
            setFailedToLoad(true);
          }
          setTimelineData(timeline);
          setGroupName(timeline.group_name);
        }
      } catch (error) {
        console.error('Error fetching timeline data:', error);
        setFailedToLoad(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTimelineData();
  }, [group_id]);

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
      // Refresh group data after deletion
      //   const updatedGroup = {
      //     ...group!,
      //     photos: group!.photos.filter(photo => photo.id !== photoId)
      //   };
      // setGroup(updatedGroup);
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  console.log(timelineData);

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
    <div className="container mx-auto p-4">
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
            className="border p-2 rounded w-full max-w-md"
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
        <table className="min-w-full bg-white border">
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
            {timelineData.photo_entries.map((photo, index) => (
              <tr key={index}>
                <td className="border p-2 whitespace-normal">
                  {photo.photo_title || 'Untitled'}
                </td>
                <td className="border p-2 whitespace-normal">
                  {photo.photo_caption || 'No description'}
                </td>
                <td className="border p-2">
                  <a
                    href={photo.photo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    View Photo
                  </a>
                </td>
                <td className="border p-2 text-center">
                  <Link
                    href={`/${group_id}/edit-photo/todo`}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 inline-block"
                  >
                    Edit
                  </Link>
                </td>
                <td className="border p-2 text-center">
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
