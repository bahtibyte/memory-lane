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
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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
          photo_entries: memoryLane.photo_entries
        });
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

  return (
    <div className="bg-[#1A1A1A] border border-[#242424] rounded-lg p-6 mb-6">
      <h2 className="text-white font-medium mb-4">Privacy Settings</h2>
      <p className="text-gray-400 text-sm mb-6">
        Control who can view this timeline. Public timelines can be viewed by anyone,
        while private timelines require a password to access.
      </p>

      <div className="flex items-center gap-6 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={isPublic}
            onChange={() => handlePrivacyChange(true)}
            className="text-purple-300 focus:ring-purple-300"
          />
          <span className="text-white">Public</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={!isPublic}
            onChange={() => handlePrivacyChange(false)}
            className="text-purple-300 focus:ring-purple-300"
          />
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
              className="flex-1 bg-[#0E0E0E] border border-[#242424] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-300"
              placeholder="Enter password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-purple-300 hover:text-purple-400 transition-colors text-sm"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
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

      {showSavePrivacy && (
        <button
          onClick={handlePrivacyUpdate}
          className="px-6 py-2 bg-purple-300 text-black rounded-lg hover:bg-purple-400 transition-colors whitespace-nowrap font-medium"
        >
          Save Privacy Settings
        </button>
      )}
    </div>
  );
}