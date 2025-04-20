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
                message: 'ERROR: ROLL_NUMBER_REQUIRED',
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
                    message: `SUCCESS: ${subject.toUpperCase()}_MARKS_SUBMITTED`,
                    type: 'success'
                });
            } else {
                setNotification({
                    message: `ERROR: ${result.error || 'SUBMISSION_FAILED'}`,
                    type: 'error'
                });
            }
        } catch (error) {
            setNotification({
                message: 'ERROR: CONNECTION_FAILED',
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
        <div className="min-h-screen flex flex-col p-8">
            <header className="mb-16 flex justify-between items-center">
                <h1 className="text-3xl font-bold font-mono text-lime">IHS_ANALYZER<span className="text-xs text-gray-500 ml-2">v1.0</span></h1>
                <div className="text-xs text-gray-500 font-mono">{new Date().toISOString().split('T')[0].replace(/-/g, '/')}</div>
            </header>

            <div className="mb-8 panel p-4 mx-auto w-full max-w-md relative">
                <div className="absolute -top-2 right-4 text-xs text-blue font-mono">// USER_IDENTIFICATION</div>
                <label htmlFor="rollNumber" className="block text-sm font-mono text-gray-300 mb-2">
                    ROLL_NUMBER:
                </label>
                <input
                    id="rollNumber"
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="ENTER_ROLL_NUMBER"
                    className="input-field w-full"
                />
            </div>

            {notification.message && (
                <div className={`mb-8 p-4 mx-auto w-full max-w-md font-mono text-sm border-2 ${notification.type === 'success'
                        ? 'border-lime text-lime'
                        : 'border-red-500 text-red-500'
                    }`}>
                    {notification.message}
                </div>
            )}

            <div className="grid-asymmetric mb-16 mx-auto w-full max-w-6xl">
                <SubjectBox
                    title="Political Science"
                    onSubmit={(data) => handleSubjectSubmit('Political Science', data)}
                    color="lime"
                />
                <SubjectBox
                    title="History"
                    onSubmit={(data) => handleSubjectSubmit('History', data)}
                />
                <SubjectBox
                    title="Economics"
                    onSubmit={(data) => handleSubjectSubmit('Economics', data)}
                    color="blue"
                />
            </div>

            {isLoading && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="h-16 w-16 relative">
                        <div className="h-full w-full border-2 border-lime border-t-transparent animate-spin rounded-full"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-mono text-lime">LOAD</span>
                        </div>
                    </div>
                </div>
            )}

            <footer className="mt-auto pt-8 text-center">
                <div className="flex justify-center items-center space-x-8">
                    <div className="h-px w-16 bg-gray-medium"></div>
                    <p className="text-gray-500 text-xs font-mono">
                        © {new Date().getFullYear()} // IHS_MARKS_ANALYZER
                    </p>
                    <div className="h-px w-16 bg-gray-medium"></div>
                </div>
            </footer>
        </div>
    );
}