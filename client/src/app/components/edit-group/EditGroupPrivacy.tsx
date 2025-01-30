import { MemoryLane } from "@/app/utils/types";
import { useState } from "react";
import { updateGroupPrivacy } from "@/app/utils/api";
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
  );
}