'use client';

import React from 'react';
import SubjectBox from '@/components/SubjectBox';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const router = useRouter();
    const [rollNumber, setRollNumber] = React.useState('');
    const [notification, setNotification] = React.useState({ message: '', type: '' });
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubjectSubmit = async (subject: string, data: { taName: string; marks: number }) => {
        if (!rollNumber.trim()) {
            setNotification({
                message: 'Please enter your roll number first',
                type: 'error'
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/marks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    rollNumber,
                    subject,
                    taName: data.taName,
                    marks: data.marks,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setNotification({
                    message: `Marks for ${subject} submitted successfully!`,
                    type: 'success'
                });
            } else {
                setNotification({
                    message: result.error || 'Failed to submit marks',
                    type: 'error'
                });
            }
        } catch (error) {
            setNotification({
                message: 'An error occurred while submitting marks',
                type: 'error'
            });
        } finally {
            setIsLoading(false);

            // Clear notification after 3 seconds
            setTimeout(() => {
                setNotification({ message: '', type: '' });
            }, 3000);
        }
    };

    return (
        <div className="min-h-screen flex flex-col p-4 md:p-8">
            <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-center glow-effect bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
                    IHS Marks Analyzer
                </h1>
            </header>

            <div className="mb-6 glassmorphism p-4 mx-auto max-w-md w-full">
                <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-300 mb-1">
                    Your Roll Number
                </label>
                <input
                    id="rollNumber"
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="Enter your roll number"
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
            </div>

            {notification.message && (
                <div className={`mb-6 p-3 rounded-md text-center mx-auto max-w-md w-full ${notification.type === 'success' ? 'bg-green-900/60 text-green-200' : 'bg-red-900/60 text-red-200'
                    }`}>
                    {notification.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
                <SubjectBox
                    title="Political Science"
                    onSubmit={(data) => handleSubjectSubmit('Political Science', data)}
                />
                <SubjectBox
                    title="History"
                    onSubmit={(data) => handleSubjectSubmit('History', data)}
                />
                <SubjectBox
                    title="Economics"
                    onSubmit={(data) => handleSubjectSubmit('Economics', data)}
                />
            </div>

            {isLoading && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            )}

            <footer className="mt-auto pt-8 text-center text-gray-500 text-sm">
                © {new Date().getFullYear()} IHS Marks Analyzer. All rights reserved.
            </footer>
        </div>
    );
}