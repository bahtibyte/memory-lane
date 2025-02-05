import { MemoryLane } from "@/core/utils/types";
import { useState } from "react";
import { updateGroupPrivacy } from "@/core/utils/api";
import { useRouter } from "next/navigation";

interface EditGroupPrivacyProps {
  memoryId: string;
  memoryLane: MemoryLane;
  setMemoryLane: (data: MemoryLane) => void;
}

export default function EditGroupPrivacy({ memoryId, memoryLane, setMemoryLane }: EditGroupPrivacyProps) {
  const router = useRouter();

  const [isPublic, setIsPublic] = useState(memoryLane.group_data.is_public);
  const [password, setPassword] = useState(memoryLane.group_data.passcode ?? '');
  const [showPassword, setShowPassword] = useState(false);
  const [showSavePrivacy, setShowSavePrivacy] = useState(false);
  const [showCancelButton, setShowCancelButton] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [highlightEditButton, setHighlightEditButton] = useState(false);

  const handlePrivacyUpdate = async () => {
    try {
      console.log('updating privacy', isPublic, password);
      const result = await updateGroupPrivacy({
        memory_id: memoryId,
        is_public: isPublic,
        passcode: password
      });
      console.log('result', result);
      if (result.group_data) {
        setMemoryLane({
          group_data: result.group_data,
          photo_entries: memoryLane.photo_entries,
          friends: memoryLane.friends
        });
        setShowSavePrivacy(false);
        setShowCancelButton(false);
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
    setShowCancelButton(true);
  };

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    setShowSavePrivacy(newPassword !== memoryLane.group_data.passcode);
    setShowCancelButton(true);
  };

  const handleEditPasswordClick = () => {
    setIsEditingPassword(true);
    setShowSavePrivacy(password !== memoryLane.group_data.passcode);
    setShowCancelButton(true);
  };

  const handleCancel = () => {
    setIsEditingPassword(false);
    setShowPassword(false);
    setShowSavePrivacy(false);
    // Reset password to original value
    setPassword(memoryLane.group_data.passcode ?? '');
    // Reset privacy to original value
    setIsPublic(memoryLane.group_data.is_public);
  };

  return (
    <div className="bg-[#1A1A1A] border border-[#242424] rounded-lg p-6 mb-6">
      <h2 className="text-white font-medium mb-4">Privacy Settings</h2>
      <p className="text-gray-400 text-sm mb-6">
        Control who can view this timeline. Public timelines can be viewed by anyone,
        while private timelines require a password to access.
      </p>

      <div className="flex items-center gap-6 mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative inline-flex items-center">
            <input
              type="radio"
              checked={isPublic}
              onChange={() => handlePrivacyChange(true)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#242424] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
          </div>
          <span className="text-white">Public</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative inline-flex items-center">
            <input
              type="radio"
              checked={!isPublic}
              onChange={() => handlePrivacyChange(false)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#242424] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
          </div>
          <span className="text-white">Private</span>
        </label>
      </div>

      {!isPublic && (
        <div className="mb-6">
          <label className="block text-white font-medium mb-2">Password Protection:</label>
          <div className="flex items-center gap-3">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              onClick={() => !isEditingPassword && setHighlightEditButton(true)}
              onMouseLeave={() => setHighlightEditButton(false)}
              className={`flex-1 bg-[#0E0E0E] border border-[#242424] rounded-lg px-4 py-2 text-white focus:outline-none ${isEditingPassword
                ? 'focus:border-purple-300 focus:ring-1 focus:ring-purple-300 transition-all duration-200'
                : 'cursor-default'
                } ${!isEditingPassword ? 'bg-opacity-50' : ''}`}
              readOnly={!isEditingPassword}
              placeholder="Enter password"
            />
            {!isEditingPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 text-purple-300 hover:text-purple-400 hover:scale-110 transition-all duration-200"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            )}
            {!isEditingPassword ? (
              <button
                type="button"
                onClick={() => {
                  handleEditPasswordClick();
                  setShowPassword(true);
                }}
                className={`p-2 text-purple-300 rounded-lg transition-all duration-200 ${highlightEditButton
                  ? 'text-purple-400 scale-110 animate-pulse border-2 border-purple-400 bg-purple-400/10'
                  : 'hover:text-purple-400 hover:scale-110'
                  }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
      )}

      {showSuccessMessage && (
        <div className="text-sm text-green-400 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Privacy settings updated successfully
        </div>
      )}

      {isEditingPassword && (
        <div className="flex gap-3">
          {showSavePrivacy &&
            <button
              onClick={() => {
                handlePrivacyUpdate();
                setIsEditingPassword(false);
                setShowPassword(false);
              }}
              className="px-6 py-2 bg-purple-300 text-black rounded-lg hover:bg-purple-400 hover:scale-105 hover:shadow-lg hover:shadow-purple-300/20 transition-all duration-200 whitespace-nowrap font-medium"
            >
              Save Privacy
            </button>
          }
          {showCancelButton &&
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-[#242424] text-purple-300 rounded-lg hover:bg-[#2A2A2A] hover:text-purple-400 hover:scale-105 transition-all duration-200 whitespace-nowrap"
            >
              Cancel
            </button>
          }
        </div>
      )}
    </div>
  );
}