'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTimeline } from '@/app/context/timeline-context';
import { deletePhoto, updateGroupAlias, updateGroupName, updateGroupPrivacy } from '@/app/utils/api';

export default function EditGroupPage() {
  const group_id = useParams()['group-id'] as string;
  const router = useRouter();

  const {
    memoryLane,
    setMemoryLane,
    loading,
    failedToLoad,
    fetchData
  } = useTimeline();

  const [groupName, setGroupName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSavePrivacy, setShowSavePrivacy] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [enableCustomUrl, setEnableCustomUrl] = useState<boolean>(false);
  const [alias, setAlias] = useState('');
  const [showUrlSuccess, setShowUrlSuccess] = useState(false);
  const [showUrlSaveButton, setShowUrlSaveButton] = useState(false);
  const [showNameSuccess, setShowNameSuccess] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => { fetchData(group_id); }, [group_id, fetchData]);

  useEffect(() => {
    if (memoryLane) {
      console.log('setting variables', memoryLane);
      const alias_exists: boolean = memoryLane.group_info.alias_url !== null && memoryLane.group_info.alias_url !== undefined;
      setGroupName(memoryLane.group_info.group_name);
      setIsPublic(memoryLane.group_info.is_public);
      setPassword(memoryLane.group_info.passcode ?? '');
      setEnableCustomUrl(alias_exists);
      setAlias(memoryLane.group_info.alias || '');
    }
  }, [memoryLane]);

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await updateGroupName({
        memory_lane: group_id,
        group_name: groupName
      });
      if (result.group_info) {
        console.log('group name updated', result.group_info);
        if (memoryLane) {
          setMemoryLane({
            group_info: result.group_info,
            photo_entries: memoryLane.photo_entries
          });
        }
        // Show success message and hide it after 3 seconds
        setShowNameSuccess(true);
        setIsEditingName(false);
      }
      setTimeout(() => {
        setShowNameSuccess(false);
      }, 3000);

      router.refresh();
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  const handlePrivacyUpdate = async () => {
    try {
      const result = await updateGroupPrivacy({
        memory_lane: group_id,
        is_public: isPublic,
        passcode: password
      });

      if (result.group_info) {
        if (memoryLane) {
          setMemoryLane({
            group_info: result.group_info,
            photo_entries: memoryLane.photo_entries
          });
        }
        setShowSavePrivacy(false);
        setShowSuccessMessage(true);
      }

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

      router.refresh();
    } catch (error) {
      console.error('Error updating privacy settings:', error);
    }
  };

  const handlePrivacyChange = (isPublic: boolean) => {
    setIsPublic(isPublic);
    setShowSavePrivacy(true);
  };

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    setShowSavePrivacy(true);
  };

  const handleDeletePhoto = async (photo_id: number) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const result = await deletePhoto(group_id, photo_id);
      console.log('deletePhoto result', result);

      if (result.deleted_photo) {
        if (memoryLane) {
          setMemoryLane({
            group_info: memoryLane.group_info,
            photo_entries: memoryLane.photo_entries.filter((photo_entry) => photo_entry.photo_id !== result.deleted_photo.photo_id)
          });
        }
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const handleUrlAliasUpdate = async () => {
    try {
      const result = await updateGroupAlias({
        memory_lane: group_id,
        alias: enableCustomUrl ? alias : null
      });

      if (result.group_info) {
        if (window.location.origin + window.location.pathname === memoryLane?.group_info.alias_url + '/edit-group' &&
          memoryLane?.group_info.alias_url !== result.group_info.alias_url) {
          console.log('pushing to new alias url');
          router.push(result.group_info.alias_url + '/edit-group');
          return;
        }

        setMemoryLane({
          group_info: result.group_info,
          photo_entries: memoryLane!.photo_entries
        });
        setShowUrlSaveButton(false);
        setShowUrlSuccess(true);
        setUrlError(null);
      } else if (result.error) {
        setUrlError(result.error);
        // Reset form state to original values
        if (memoryLane) {
          const alias_exists = memoryLane.group_info.alias_url !== null && memoryLane.group_info.alias_url !== undefined;
          setEnableCustomUrl(alias_exists);
          setAlias(memoryLane.group_info.alias || '');
        }
        setIsEditingAlias(false);
        setShowUrlSaveButton(false);
      }

      setTimeout(() => {
        setShowUrlSuccess(false);
      }, 3000);

      router.refresh();
    } catch (error) {
      console.error('Error updating URL alias:', error);
      setUrlError('An unexpected error occurred');
    }
  };

  const handleAliasChange = (newAlias: string) => {
    setAlias(newAlias);
    setShowUrlSaveButton(true);
    setUrlError(null);
  };

  const handleCustomUrlToggle = (enabled: boolean) => {
    setEnableCustomUrl(enabled);
    setShowUrlSaveButton(true);
    if (!enabled) {
      setIsEditingAlias(false);
    } else {
      setIsEditingAlias(true);
    }
  };

  const handleEditClick = () => {
    setIsEditingName(true);
  };

  const handleEditAliasClick = () => {
    setIsEditingAlias(true);
    setShowUrlSaveButton(true);
    setUrlError(null);
  };

  // Add new function to handle copying text
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        // Could add a toast notification here if desired
        console.log('URL copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy URL:', err);
      });
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
          <div className="flex items-center gap-2">
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="border p-2 rounded w-full max-w-md text-black"
              readOnly={!isEditingName}
              style={{ backgroundColor: !isEditingName ? '#f3f4f6' : 'white' }}
            />
            {!isEditingName ? (
              <button
                type="button"
                onClick={handleEditClick}
                className="p-2 text-blue-500 hover:text-blue-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
        {showNameSuccess && (
          <div className="text-sm text-green-500 mb-4">
            ✓ Group name has been updated successfully
          </div>
        )}
        {isEditingName && (
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save Name
          </button>
        )}
      </form>

      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Privacy Settings</h2>
        <p className="mb-4 text-gray-200">
          Control who can view this timeline. Public timelines can be viewed by anyone,
          while private timelines require a password to access.
        </p>

        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center">
            <input
              type="radio"
              checked={isPublic}
              onChange={() => handlePrivacyChange(true)}
              className="mr-2"
            />
            Public
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={!isPublic}
              onChange={() => handlePrivacyChange(false)}
              className="mr-2"
            />
            Private
          </label>
        </div>

        {!isPublic && (
          <div className="mb-4">
            <label className="block mb-2">Password Protection:</label>
            <div className="flex items-center gap-2">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="border p-2 rounded text-black"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-sm text-blue-400 hover:text-blue-500"
              >
                {showPassword ? "Hide" : "Show"} Password
              </button>
            </div>
          </div>
        )}

        {showSuccessMessage && (
          <div className="text-sm text-green-500 mb-4">
            ✓ New privacy settings are in effect
          </div>
        )}

        {showSavePrivacy && (
          <button
            onClick={handlePrivacyUpdate}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Save Privacy Settings
          </button>
        )}
      </div>

      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">URL Settings</h2>
        <p className="mb-4 text-gray-200">
          Configure how users can access your timeline.
        </p>

        {memoryLane && (
          <div className="mb-4">
            <p className="text-sm text-gray-300 mb-2">Current URL:</p>
            <div className="flex items-center gap-2">
              <code
                onClick={() => handleCopyUrl(memoryLane.group_info.group_url)}
                className="bg-gray-800 p-2 rounded block flex-grow cursor-pointer hover:bg-gray-700"
              >
                {memoryLane.group_info.group_url}
              </code>
              <Link
                href={memoryLane.group_info.group_url}
                target="_blank"
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm whitespace-nowrap"
              >
                Open
              </Link>
            </div>

            {enableCustomUrl && memoryLane.group_info.alias_url && (
              <>
                <p className="text-sm text-gray-300 mt-4 mb-2">Custom URL:</p>
                <div className="flex items-center gap-2">
                  <code
                    onClick={() => handleCopyUrl(memoryLane.group_info.alias_url!)}
                    className="bg-gray-800 p-2 rounded block flex-grow cursor-pointer hover:bg-gray-700"
                  >
                    {memoryLane.group_info.alias_url}
                  </code>
                  <Link
                    href={memoryLane.group_info.alias_url}
                    target="_blank"
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm whitespace-nowrap"
                  >
                    Open
                  </Link>
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={enableCustomUrl}
              onChange={(e) => handleCustomUrlToggle(e.target.checked)}
              className="mr-2"
            />
            Enable Custom URL
          </label>
        </div>

        {enableCustomUrl && (
          <div className="mb-4">
            <label className="block mb-2">Custom Alias:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={alias}
                onChange={(e) => handleAliasChange(e.target.value)}
                className="border p-2 rounded w-full max-w-md text-black"
                readOnly={!isEditingAlias}
                style={{ backgroundColor: !isEditingAlias ? '#f3f4f6' : 'white' }}
                placeholder="Enter custom URL alias"
              />
              {!isEditingAlias && (
                <button
                  type="button"
                  onClick={handleEditAliasClick}
                  className="p-2 text-blue-500 hover:text-blue-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
              )}
            </div>
            {urlError && (
              <div className="text-sm text-red-500 mt-2">
                ⚠️ {urlError}
              </div>
            )}
            <p className="text-sm text-gray-400 mt-1">
              This will create an additional URL to access your timeline
            </p>
          </div>
        )}

        {showUrlSuccess && (
          <div className="text-sm text-green-500 mb-4">
            ✓ Custom URL has been updated successfully
          </div>
        )}

        {showUrlSaveButton && (
          <button
            onClick={() => {
              handleUrlAliasUpdate();
              setIsEditingAlias(false);
            }}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Save URL Settings
          </button>
        )}
      </div>

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
                      href={`/${group_id}/edit-photo/${photo.photo_id}`}
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
