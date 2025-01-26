'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateGroup() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        groupName: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        try {
            console.log('Sending data:', formData); // Debug log
            console.log(formData)
            const response = await fetch('http://localhost:5000/api/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create group');
            }

            console.log('Success:', data); // Debug log
            
            // Redirect to home page or group page
            router.push('/');
            
        } catch (error) {
            console.error('Error:', error);
            setError(error instanceof Error ? error.message : 'Failed to create group');
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
        <main className="min-h-screen p-8">
            <h1 className="text-3xl mb-6">Create New Group</h1>
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="max-w-md space-y-4">
                <div>
                    <label htmlFor="groupName" className="block text-sm font-medium mb-1">
                        Group Name
                    </label>
                    <input
                        type="text"
                        id="groupName"
                        value={formData.groupName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md text-black"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md text-black"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md text-black"
                        required
                    />
                </div>
                <button 
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                >
                    Create Group
                </button>
            </form>
        </main>
    );
}