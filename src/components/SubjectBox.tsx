'use client';

import React from 'react';

type SubjectBoxProps = {
    title: string;
    onSubmit: (data: { taName: string; marks: number }) => void;
    color?: 'lime' | 'blue';
};

const taOptions = ['Tanveer', 'Sreenivas', 'Medha', 'Sathvika', 'Anushka', 'Tanish', 'Kriti', 'Gargie', 'Rohan', 'Aadi', 'Asirith', 'Chetan', 'Rushil', 'Akshit', 'Chandana'];

export default function SubjectBox({ title, onSubmit, color }: SubjectBoxProps) {
    const [taName, setTaName] = React.useState(taOptions[0]);
    const [marks, setMarks] = React.useState<number>(0);

    const accentColor = color || 'white';
    const borderColor = `border-${accentColor}`;
    const textColor = `text-${accentColor}`;
    const btnClass = color ? `btn-${color}` : 'btn-blue';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ taName, marks });
    };

    return (
        <div className={`panel p-6 w-full relative ${color ? `panel-${color === 'lime' ? 'highlight' : 'secondary'}` : ''}`}>
            <div className="absolute -top-5 left-4 text-xs font-mono text-gray-500">// {title.toUpperCase().replace(' ', '_')}_MODULE</div>

            <h2 className={`text-xl font-bold mb-6 font-mono uppercase ${accentColor === 'lime' ? 'text-lime' : accentColor === 'blue' ? 'text-blue' : 'text-white'}`}>
                {title.replace(' ', '_')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor={`ta-${title}`} className="block text-xs font-mono text-gray-300 mb-2 uppercase">
                        Teaching_Assistant:
                    </label>
                    <select
                        id={`ta-${title}`}
                        value={taName}
                        onChange={(e) => setTaName(e.target.value)}
                        className="input-field w-full appearance-none"
                    >
                        {taOptions.map((name) => (
                            <option key={name} value={name} className="bg-black">
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor={`marks-${title}`} className="block text-xs font-mono text-gray-300 mb-2 uppercase">
                        Marks_[0-30]:
                    </label>
                    <input
                        id={`marks-${title}`}
                        type="number"
                        min="0"
                        max="30"
                        value={marks}
                        onChange={(e) => setMarks(parseInt(e.target.value))}
                        className="input-field w-full"
                    />
                </div>

                <button
                    type="submit"
                    className={`btn ${btnClass} w-full`}
                >
                    SUBMIT()
                </button>
            </form>
        </div>
    );
}