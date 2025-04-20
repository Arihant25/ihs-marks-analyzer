'use client';

import React from 'react';

type SubjectBoxProps = {
    title: string;
    onSubmit: (data: { taName: string; marks: number }) => void;
};

const taOptions = ['Tanveer', 'Sreenivas', 'Medha', 'Sathvika', 'Anushka', 'Tanish', 'Kriti', 'Gargie', 'Rohan', 'Aadi', 'Asirith', 'Chetan', 'Rushil', 'Akshit', 'Chandana'];

export default function SubjectBox({ title, onSubmit }: SubjectBoxProps) {
    const [taName, setTaName] = React.useState(taOptions[0]);
    const [marks, setMarks] = React.useState<number>(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ taName, marks });
    };

    return (
        <div className="glassmorphism p-6 w-full">
            <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                {title}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor={`ta-${title}`} className="block text-sm font-medium text-gray-300 mb-1">
                        Teaching Assistant
                    </label>
                    <select
                        id={`ta-${title}`}
                        value={taName}
                        onChange={(e) => setTaName(e.target.value)}
                        className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        {taOptions.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor={`marks-${title}`} className="block text-sm font-medium text-gray-300 mb-1">
                        Marks (out of 30)
                    </label>
                    <input
                        id={`marks-${title}`}
                        type="number"
                        min="0"
                        max="30"
                        value={marks}
                        onChange={(e) => setMarks(parseInt(e.target.value))}
                        className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-md transition-all duration-200 transform hover:scale-105"
                >
                    Save
                </button>
            </form>
        </div>
    );
}