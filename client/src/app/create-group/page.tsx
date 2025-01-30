'use client';
import { useState } from 'react';
import { createGroup } from '../utils/api';

export default function CreateGroup() {
  const [formData, setFormData] = useState({
    group_name: ''
  });
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [groupInfo, setGroupInfo] = useState<{ name: string; url: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await createGroup(formData);

      if (response) {
        setIsSuccess(true);
        setGroupInfo({
          name: response.result.group_name,
          url: response.result.group_url,
        });
      } else {
        throw new Error('Failed to create group');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  return (
    <main className="min-h-screen p-8 flex flex-col items-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl mb-6 text-center">Create New Group</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        {isSuccess && groupInfo ? (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
            <h2 className="text-xl mb-2">Group Created Successfully!</h2>
            <p className="mb-2">Your timeline for {groupInfo.name} is accessible here:</p>
            <a
              href={groupInfo.url}
              className="text-blue-600 hover:text-blue-800 underline block mb-4"
            >
              {groupInfo.url}
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div>
              <label htmlFor="groupName" className="block text-sm font-medium mb-1">
                Group Name
              </label>
              <input
                type="text"
                id="group_name"
                value={formData.group_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md text-black"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Group...' : 'Create Group'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}