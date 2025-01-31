import { updateGroupAlias } from "@/core/utils/api";
import { MemoryLane } from "@/core/utils/types";
import { useRouter } from "next/dist/client/components/navigation";
import Link from "next/link";
import { useState } from "react";
interface EditGroupAliasProps {
  memoryId: string;
  memoryLane: MemoryLane;
  setMemoryLane: (data: MemoryLane) => void;
}

export default function EditGroupAlias({ memoryId, memoryLane, setMemoryLane }: EditGroupAliasProps) {
  const alias_exists: boolean = memoryLane.group_data.alias_url !== null && memoryLane.group_data.alias_url !== undefined;

  const router = useRouter();
  const [enableCustomUrl, setEnableCustomUrl] = useState<boolean>(alias_exists);
  const [alias, setAlias] = useState(memoryLane.group_data.alias || '');
  const [showUrlSuccess, setShowUrlSuccess] = useState(false);
  const [showUrlSaveButton, setShowUrlSaveButton] = useState(false);
  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  const handleUrlAliasUpdate = async () => {
    try {
      // Validate format before saving
      if (enableCustomUrl && alias) {
        const validAlias = alias
          .replace(/[^a-z-]/g, '')         // Remove any invalid characters
          .replace(/^-+|-+$/g, '')         // Remove hyphens from start and end
          .replace(/-+/g, '-');            // Replace multiple hyphens with single hyphen

        if (validAlias !== alias) {
          setUrlError('Custom URL can only contain lowercase letters and hyphens between characters');
          return;
        }
      }

      const result = await updateGroupAlias({
        memory_id: memoryId,
        alias: enableCustomUrl ? alias : null
      });

      if (result.group_data) {
        if (window.location.origin + window.location.pathname === memoryLane?.group_data.alias_url + '/edit-group' &&
          memoryLane?.group_data.alias_url !== result.group_data.alias_url) {
          console.log('pushing to new alias url');
          router.push(result.group_data.alias_url + '/edit-group');
          return;
        }

        setMemoryLane({
          group_data: result.group_data,
          photo_entries: memoryLane!.photo_entries
        });
        setShowUrlSaveButton(false);
        setShowUrlSuccess(true);
        setUrlError(null);
      } else if (result.error) {
        setUrlError(result.error);
        // Reset form state to original values
        const alias_exists = memoryLane.group_data.alias_url !== null && memoryLane.group_data.alias_url !== undefined;
        setEnableCustomUrl(alias_exists);
        setAlias(memoryLane.group_data.alias || '');
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
    // Only convert to lowercase while typing
    const lowerCase = newAlias.toLowerCase();
    setAlias(lowerCase);
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

  return (
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
              onClick={() => handleCopyUrl(memoryLane.group_data.group_url)}
              className="bg-gray-800 p-2 rounded block flex-grow cursor-pointer hover:bg-gray-700"
            >
              {memoryLane.group_data.group_url}
            </code>
            <Link
              href={memoryLane.group_data.group_url}
              target="_blank"
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm whitespace-nowrap"
            >
              Open
            </Link>
          </div>

          {enableCustomUrl && memoryLane.group_data.alias_url && (
            <>
              <p className="text-sm text-gray-300 mt-4 mb-2">Custom URL:</p>
              <div className="flex items-center gap-2">
                <code
                  onClick={() => handleCopyUrl(memoryLane.group_data.alias_url!)}
                  className="bg-gray-800 p-2 rounded block flex-grow cursor-pointer hover:bg-gray-700"
                >
                  {memoryLane.group_data.alias_url}
                </code>
                <Link
                  href={memoryLane.group_data.alias_url}
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
              placeholder="Enter custom URL alias (lowercase letters and hyphens only)"
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
            Only lowercase letters and hyphens between characters are allowed (e.g., &quot;my-custom-url&quot;)
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

  );
}