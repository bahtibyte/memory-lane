import { addFriendsToGroup } from '@/core/wrappers/fetch';
import { Friend } from '@/core/utils/types';
import { useState } from 'react';

interface AddFriendsProps {
  memoryId: string;
  onFriendsAdded: (friends: Friend[]) => void;
}

interface FriendInput {
  email: string;
  name: string;
}

export default function AddFriends({ memoryId, onFriendsAdded }: AddFriendsProps) {
  const [friendInputs, setFriendInputs] = useState<FriendInput[]>([
    { email: '', name: '' }
  ]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }[]>([{}]);

  const handleAddRow = () => {
    setFriendInputs([...friendInputs, { email: '', name: '' }]);
  };

  const handleRemoveRow = (index: number) => {
    if (friendInputs.length > 1) {
      const newInputs = friendInputs.filter((_, i) => i !== index);
      setFriendInputs(newInputs);
    }
  };

  const validateEmail = (email: string) => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (index: number, field: keyof FriendInput, value: string) => {
    const newInputs = friendInputs.map((input, i) => {
      if (i === index) {
        return { ...input, [field]: value };
      }
      return input;
    });
    setFriendInputs(newInputs);

    // Update errors
    const newErrors = [...errors];
    if (field === 'email') {
      newErrors[index] = {
        ...newErrors[index],
        email: validateEmail(value) ? '' : 'Please enter a valid email address'
      };
    }
    setErrors(newErrors);
  };

  const handleSave = async () => {
    // Validate all inputs before saving
    const hasInvalidEmail = friendInputs.some((input) => !validateEmail(input.email));
    const hasMissingName = friendInputs.some(input => !input.name.trim());

    if (hasInvalidEmail || hasMissingName) {
      return;
    }

    // TODO: Implement save to database
    console.log('Saving friends:', friendInputs);

    const response = await addFriendsToGroup({
      memory_id: memoryId,
      friends: friendInputs,
    });

    handleClear();
    setIsExpanded(false);

    console.log(response);
    if (response && response.friends) {
      onFriendsAdded(response.friends);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false)
      }, 1500);
    } else {
      setShowError(true);
      setTimeout(() => {
        setShowError(false)
      }, 1500);
    }
  };

  const handleClear = () => {
    setFriendInputs([{ email: '', name: '' }]);
  };

  return (
    <div>
      <div className="flex flex-col p-3 bg-[#242424] rounded-lg mb-4">
        <div className={`flex items-center gap-3 w-full ${!isExpanded ? 'cursor-pointer' : ''}`}
          onClick={() => { if (!isExpanded) setIsExpanded(true) }}>
          {!isExpanded && (
            <>
              <div className="w-10 h-10 bg-purple-300/10 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-white">Add Friends to Group</div>
                <div className="text-gray-400 text-sm">Click the button to start adding friends to your group</div>
                {showSuccess && (
                  <div className="text-green-500 text-sm mt-1">Friends added successfully!</div>
                )}
                {showError && (
                  <div className="text-red-500 text-sm mt-1">Failed to add friends</div>
                )}
              </div>
            </>
          )}
        </div>

        {isExpanded && (
          <div className="w-full mt-4">
            <div className="space-y-3">
              {friendInputs.map((input, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Name *"
                      required
                      value={input.name}
                      onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                      className="w-full bg-[#1a1a1a] rounded-lg p-2 text-white border border-gray-700 focus:border-purple-300 focus:outline-none"
                    />

                  </div>
                  <div className="flex-1">
                    <input
                      type="email"
                      placeholder="Email (optional)"
                      value={input.email}
                      onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                      className={`w-full bg-[#1a1a1a] rounded-lg p-2 text-white border border-gray-700 focus:border-purple-300 focus:outline-none ${errors[index]?.email ? 'border-red-500' : ''}`}
                    />
                    {errors[index]?.email && (
                      <div className="text-red-500 text-xs mt-1">{errors[index].email}</div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveRow(index);
                    }}
                    disabled={friendInputs.length === 1}
                    className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center disabled:opacity-50"
                  >
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddRow();
                }}
                className="px-4 py-2 bg-purple-300/10 text-purple-300 rounded-lg hover:bg-purple-300/20"
              >
                Add Another
              </button>
              <div className="flex gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                    setIsExpanded(false);
                  }}
                  className="px-4 py-2 bg-gray-500/10 text-gray-400 rounded-lg hover:bg-gray-500/20"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  className="px-4 py-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}