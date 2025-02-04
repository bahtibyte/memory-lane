import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { User } from "@/core/utils/types";
import { generateS3Url, updateUserProfile } from "@/core/utils/api";

interface EditUserProfileProps {
  user: User | null;
  setUser: (user: User) => void;
  onClose: () => void;
}

export default function EditUserProfile({ user, setUser, onClose }: EditUserProfileProps) {

  const [uploading, setUploading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileUrl, setNewProfileUrl] = useState('');
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      console.log('there is user', user);
      setNewProfileName(user.profile_name);
      setNewProfileUrl(user.profile_url || '');
    }
  }, [user]);

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setProfileError(null);
      setShowUploadSuccess(false);

      if (!file.type.startsWith('image/')) {
        setProfileError('Please select an image file.');
        return;
      }

      const isHeic = file.type === 'image/heic' ||
        file.type === 'image/heif' ||
        file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif');

      if (isHeic) {
        setProfileError('HEIC files are not supported.');
        return;
      }

      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      const s3UrlData = await generateS3Url(file.name, 'profile');

      if (s3UrlData.presignedUrl) {
        const uploadResponse = await fetch(s3UrlData.presignedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file');
        }

        setNewProfileUrl(s3UrlData.photo_url);
        setShowUploadSuccess(true);
        
        setTimeout(() => {
          setShowUploadSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      setProfileError(error instanceof Error ? error.message : 'Failed to update profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await updateUserProfile({
        profile_name: newProfileName,
        profile_url: newProfileUrl
      });
      if (result && result.user) {
        setUser(result.user);
        onClose();
      }
    } catch (error) {
      console.error('Error updating profile name:', error);
      setProfileError(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  return (
    <div>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-[#1A1A1A] p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-xl font-bold text-white mb-4">Edit Profile</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Profile Picture Section */}
            <div>
              <label className="block text-white font-medium mb-2">Profile Picture</label>
              <div className="flex flex-col items-center">
                <div
                  className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-purple-300/50 hover:border-purple-300 cursor-pointer transition-colors"
                  onClick={handleProfilePictureClick}
                >
                  {(previewUrl || user?.profile_url) ? (
                    <Image
                      src={previewUrl || user?.profile_url || ''}
                      alt="Profile picture"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0E0E0E]">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-300"></div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.heic,.HEIC"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
                {uploading && (
                  <div className="text-sm text-purple-300 mt-2 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    File is uploading...
                  </div>
                )}
                {profileError && (
                  <div className="text-sm text-red-400 mt-2 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {profileError}
                  </div>
                )}
                {showUploadSuccess && (
                  <div className="text-sm text-green-400 mt-2 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Profile picture uploaded
                  </div>
                )}
              </div>
            </div>

            {/* Profile Name Section */}
            <div>
              <label htmlFor="profile_name" className="block text-white font-medium mb-2">
                Profile Name
              </label>
              <input
                type="text"
                id="profile_name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                className="w-full bg-[#0E0E0E] border border-[#242424] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-[#242424] text-center text-white py-2 px-4 rounded-lg hover:bg-[#2A2A2A] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-purple-300 text-center text-black py-2 px-4 rounded-lg hover:bg-purple-400 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}