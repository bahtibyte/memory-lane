import { updateGroupAlias } from "@/core/wrappers/api";
import { AppData } from "@/core/utils/types";
import { useRouter } from "next/dist/client/components/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
interface EditGroupAliasProps {
  memoryId: string;
  appData: AppData;
  setAppData: (data: AppData) => void;
}

export default function EditGroupAlias({ memoryId, appData, setAppData }: EditGroupAliasProps) {
  const aliasExists: boolean = appData.group.aliasUrl !== null && appData.group.aliasUrl !== undefined;

  const router = useRouter();
  const [enableCustomUrl, setEnableCustomUrl] = useState<boolean>(aliasExists);
  const [alias, setAlias] = useState(appData.group.alias || '');
  const [showUrlSuccess, setShowUrlSuccess] = useState(false);
  const [showUrlSaveButton, setShowUrlSaveButton] = useState(false);
  const [showCancelButton, setShowCancelButton] = useState(false);
  const [isTogglingUrl, setIsTogglingUrl] = useState(false);
  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [highlightEditButton, setHighlightEditButton] = useState(false);

  useEffect(() => {
    setAlias(appData.group.alias || '');
  }, [appData]);

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

      const { data, error } = await updateGroupAlias(memoryId, enableCustomUrl ? alias : null);

      if (data) {
        if (window.location.origin + window.location.pathname === appData.group.aliasUrl + '/edit-group' &&
          appData.group.aliasUrl !== data.group.aliasUrl) {
          router.push(data.group.aliasUrl + '/edit-group');
          return;
        }

        if (window.location.origin + window.location.pathname === appData.group.aliasUrl + '/edit-group' &&
          !data.group.alias) {
          router.push(data.group.groupUrl + '/edit-group');
          return;
        }
        setAppData({
          ...appData,
          group: data.group,
        });
        setShowUrlSaveButton(false);
        setShowCancelButton(false);
        setShowUrlSuccess(true);
        setUrlError(null);
      } else if (error) {
        setUrlError(error);
        // Reset form state to original values
        setEnableCustomUrl(aliasExists);
        setAlias(appData.group.alias || '');
        setIsEditingAlias(false);
        setShowUrlSaveButton(false);
        setShowCancelButton(false);
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
    // Only show save button if the new alias is different from the current one
    setShowUrlSaveButton(lowerCase !== appData.group.alias);
    setShowCancelButton(true);
    setUrlError(null);
  };

  const handleCustomUrlToggle = (enabled: boolean) => {
    setEnableCustomUrl(enabled);

    setShowUrlSaveButton(enabled !== aliasExists);
    setIsTogglingUrl(enabled !== aliasExists);
    setShowCancelButton(true);
    if (!enabled) {
      setIsEditingAlias(false);
    } else {
      setIsEditingAlias(true);
    }
  };

  const handleSaveAlias = () => {
    // Check the length of new alias. show error if less than 4 characters
    if (enableCustomUrl && alias.length < 4) {
      setUrlError('Alias must be at least 4 characters long');
      return;
    }
    handleUrlAliasUpdate();
    setIsEditingAlias(false);
  }

  const handleCancel = () => {
    setIsEditingAlias(false);
    setIsTogglingUrl(false);
    setShowUrlSaveButton(false);
    setShowCancelButton(false);
    setShowUrlSuccess(false);
    setUrlError(null);
    setAlias(appData.group.alias || '');
    setEnableCustomUrl(aliasExists);
  };

  const handleEditAliasClick = () => {
    setIsEditingAlias(true);
    setUrlError(null);
    setShowCancelButton(true);
  };

  const handleCopyUrl = (url: string, e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    setTooltipPosition({ x: clientX, y: clientY });

    navigator.clipboard.writeText(url)
      .then(() => {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 1000);
      })
      .catch(err => {
        console.error('Failed to copy URL:', err);
      });
  };

  return (
    <div className="bg-[#1A1A1A] border border-[#242424] rounded-lg p-6 mb-6">
      <h2 className="text-white font-medium mb-4">URL Settings</h2>
      <p className="text-gray-400 text-sm mb-6">
        Configure how users can access your timeline.
      </p>

      {showTooltip && (
        <div
          className="fixed z-50 bg-[#242424] text-purple-300 px-2 py-0.5 rounded text-xs font-medium pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y - 8
          }}
        >
          Copied URL!
        </div>
      )}

      {appData && (
        <div className="mb-6">
          <p className="text-sm text-gray-300 mb-2">Current URL:</p>
          <div className="flex items-center gap-3 mb-4">
            <code
              onClick={(e) => handleCopyUrl(appData.group.groupUrl, e)}
              className="flex-1 bg-[#0E0E0E] p-3 rounded-lg text-gray-300 cursor-pointer hover:bg-[#242424] hover:text-white hover:scale-[1.01] transition-all duration-200 overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {appData.group.groupUrl}
            </code>
            <Link
              href={appData.group.groupUrl}
              target="_blank"
              className="px-4 py-2 bg-[#242424] text-purple-300 rounded-lg hover:bg-[#2A2A2A] hover:text-purple-400 hover:scale-105 hover:shadow-lg hover:shadow-purple-300/10 transition-all duration-200 whitespace-nowrap text-sm"
            >
              Open
            </Link>
          </div>

          {enableCustomUrl && appData.group.aliasUrl && (
            <>
              <p className="text-sm text-gray-300 mb-2">Custom URL:</p>
              <div className="flex items-center gap-3">
                <code
                  onClick={(e) => handleCopyUrl(appData.group.aliasUrl!, e)}
                  className="flex-1 bg-[#0E0E0E] p-3 rounded-lg text-gray-300 cursor-pointer hover:bg-[#242424] hover:text-white hover:scale-[1.01] transition-all duration-200 overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  {appData.group.aliasUrl}
                </code>
                <Link
                  href={appData.group.aliasUrl}
                  target="_blank"
                  className="px-4 py-2 bg-[#242424] text-purple-300 rounded-lg hover:bg-[#2A2A2A] hover:text-purple-400 hover:scale-105 hover:shadow-lg hover:shadow-purple-300/10 transition-all duration-200 whitespace-nowrap text-sm"
                >
                  Open
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative inline-flex items-center">
            <input
              type="checkbox"
              checked={enableCustomUrl}
              onChange={(e) => handleCustomUrlToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#242424] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
          </div>
          <span className="text-white">Enable Custom URL</span>
        </label>
      </div>

      {enableCustomUrl && (
        <div className="mb-6">
          <label className="block text-white font-medium mb-2">Custom Alias:</label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={alias}
              onChange={(e) => handleAliasChange(e.target.value)}
              onClick={() => !isEditingAlias && setHighlightEditButton(true)}
              onMouseLeave={() => setHighlightEditButton(false)}
              className={`flex-1 bg-[#0E0E0E] border border-[#242424] rounded-lg px-4 py-2 text-white focus:outline-none ${isEditingAlias
                ? 'focus:border-purple-300 focus:ring-1 focus:ring-purple-300 transition-all duration-200'
                : 'cursor-default'
                } ${!isEditingAlias ? 'bg-opacity-50' : ''}`}
              readOnly={!isEditingAlias}
              placeholder="Enter custom URL alias (lowercase letters and hyphens only)"
            />
            {!isEditingAlias && (
              <button
                type="button"
                onClick={handleEditAliasClick}
                className={`p-2 text-purple-300 rounded-lg transition-all duration-200 ${highlightEditButton
                  ? 'text-purple-400 scale-110 animate-pulse border-2 border-purple-400 bg-purple-400/10'
                  : 'hover:text-purple-400 hover:scale-110'
                  }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </button>
            )}
          </div>
          {urlError && (
            <div className="text-sm text-red-400 mt-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {urlError}
            </div>
          )}
          <p className="text-sm text-gray-400 mt-2">
            Only lowercase letters and hyphens between characters are allowed (e.g., &quot;my-custom-url&quot;)
          </p>
        </div>
      )}

      {showUrlSuccess && (
        <div className="text-sm text-green-400 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Custom URL has been updated successfully
        </div>
      )}

      {(isEditingAlias || isTogglingUrl) && (
        <div className="flex gap-3">
          {showUrlSaveButton && (
            <button
              onClick={handleSaveAlias}
              className="px-6 py-2 bg-purple-300 text-black rounded-lg hover:bg-purple-400 hover:scale-105 hover:shadow-lg hover:shadow-purple-300/20 transition-all duration-200 whitespace-nowrap font-medium"
            >
              Save URL Settings
            </button>
          )}
          {showCancelButton && (
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-[#242424] text-purple-300 rounded-lg hover:bg-[#2A2A2A] hover:text-purple-400 hover:scale-105 transition-all duration-200 whitespace-nowrap"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}