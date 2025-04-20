'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import AnimatedButton from '@/components/AnimatedButton';
import RotateDevicePrompt from '@/components/RotateDevicePrompt';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

// Define the data structure for our API response
type AnalysisData = {
    averageMarksByTA: {
        subject: string;
        taName: string;
        averageMarks: number;
        count: number;
    }[];
    marksDistribution: {
        subject: string;
        marks: number;
        count: number;
    }[];
};

export default function Analysis() {
    const router = useRouter();
    const [pageLoading, setPageLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

    // Added page loading animation
    useEffect(() => {
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    // Logout handler
    const handleLogout = async () => {
        await signOut({ callbackUrl: "/" });
    };

    // Colors for subjects - Updated History to orange
    const subjectColors = {
        'Political Science': 'rgba(191, 255, 0, 0.8)', // lime
        'History': 'rgba(255, 122, 0, 0.8)', // orange (changed from white)
        'Economics': 'rgba(0, 224, 255, 0.8)', // blue
    };

    const borderColors = {
        'Political Science': 'rgb(191, 255, 0)',
        'History': 'rgb(255, 122, 0)', // orange (changed from white)
        'Economics': 'rgb(0, 224, 255)',
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/analysis');

                if (!response.ok) {
                    throw new Error('Failed to fetch analysis data');
                }

                const data = await response.json();
                setAnalysisData(data);
            } catch (err) {
                console.error('Error fetching analysis data:', err);
                setError('ERROR: FAILED_TO_FETCH_DATA');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Prepare data for TA Performance chart (bar chart)
    const prepareTAChartData = (subject: string) => {
        if (!analysisData) return null;

        const subjectData = analysisData.averageMarksByTA.filter(
            item => item.subject === subject
        );

        return {
            labels: subjectData.map(item => item.taName),
            datasets: [
                {
                    label: `Average Marks for ${subject}`,
                    data: subjectData.map(item => item.averageMarks),
                    backgroundColor: subjectColors[subject as keyof typeof subjectColors],
                    borderColor: borderColors[subject as keyof typeof borderColors],
                    borderWidth: 2,
                }
            ]
        };
    };

    // Prepare data for Marks Distribution chart (line chart)
    const prepareDistributionChartData = () => {
        if (!analysisData) return null;

        // Create bins for decimal marks (0, 0.5, 1, 1.5, ..., 30)
        const allMarks = Array.from({ length: 61 }, (_, i) => i * 0.5);

        // Create datasets for each subject
        const datasets = Object.keys(subjectColors).map(subject => {
            // Get distribution data for this subject
            const subjectData = analysisData.marksDistribution.filter(
                item => item.subject === subject
            );

            // Create an array of counts for each mark bin
            const counts = allMarks.map(mark => {
                // For each bin, find exact match or closest mark
                const found = subjectData.find(item => 
                    Math.abs(item.marks - mark) < 0.01 // Allow tiny difference for floating-point comparison
                );
                return found ? found.count : 0;
            });

            return {
                label: subject,
                data: counts,
                borderColor: borderColors[subject as keyof typeof borderColors],
                backgroundColor: subjectColors[subject as keyof typeof subjectColors],
                borderWidth: 2,
                tension: 0.2,
                pointRadius: 3,
            };
        });

        return {
            labels: allMarks.map(mark => mark.toFixed(1)), // Format labels as "0.0", "0.5", etc.
            datasets,
        };
    };

    // Prepare data for individual TA performance across subjects (bar chart)
    const prepareTAPerformanceAcrossSubjects = (taName: string) => {
        if (!analysisData) return null;

        const taData = analysisData.averageMarksByTA.filter(
            item => item.taName === taName
        );

        return {
            labels: taData.map(item => item.subject),
            datasets: [
                {
                    label: `${taName}'s Average Marks`,
                    data: taData.map(item => item.averageMarks),
                    backgroundColor: taData.map(item => subjectColors[item.subject as keyof typeof subjectColors]),
                    borderColor: taData.map(item => borderColors[item.subject as keyof typeof borderColors]),
                    borderWidth: 2,
                }
            ]
        };
    };

    // Get unique TA names
    const getUniqueTAs = () => {
        if (!analysisData) return [];

        const taNames = analysisData.averageMarksByTA.map(item => item.taName);
        return [...new Set(taNames)];
    };

    // Chart options
    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: {
                    family: 'JetBrains Mono',
                },
                bodyFont: {
                    family: 'JetBrains Mono',
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 30,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    font: {
                        family: 'JetBrains Mono',
                    },
                    color: 'rgba(255, 255, 255, 0.7)',
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        family: 'JetBrains Mono',
                    },
                    color: 'rgba(255, 255, 255, 0.7)',
                },
            },
        },
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    font: {
                        family: 'JetBrains Mono',
                    },
                    color: 'rgba(255, 255, 255, 0.7)',
                    usePointStyle: true,
                },
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: {
                    family: 'JetBrains Mono',
                },
                bodyFont: {
                    family: 'JetBrains Mono',
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Students',
                    font: {
                        family: 'JetBrains Mono',
                    },
                    color: 'rgba(255, 255, 255, 0.7)',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    font: {
                        family: 'JetBrains Mono',
                    },
                    color: 'rgba(255, 255, 255, 0.7)',
                    // Ensure student count is always displayed as integers
                    callback: function(value: any) {
                        if (Math.floor(value) === value) {
                            return value;
                        }
                        return '';
                    }
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Marks (0-30)',
                    font: {
                        family: 'JetBrains Mono',
                    },
                    color: 'rgba(255, 255, 255, 0.7)',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    font: {
                        family: 'JetBrains Mono',
                    },
                    color: 'rgba(255, 255, 255, 0.7)',
                    maxRotation: 90,
                    minRotation: 45,
                    // Only show every fifth mark to prevent overcrowding
                    callback: function(value: any, index: number) {
                        return index % 5 === 0 ? value : '';
                    }
                },
            },
        },
    };

    if (pageLoading) {
        return (
            <div className="loading-screen">
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col p-4 md:p-8">
            {/* Rotation Prompt for Mobile Devices */}
            <RotateDevicePrompt />

            <header className="mb-8 md:mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-mono text-lime">IHS_ANALYZER<span className="text-xs text-gray-500 ml-2">v1.0</span></h1>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div>
                        <AnimatedButton color="orange" onClick={() => router.push('/dashboard')}>
                            DASHBOARD()
                        </AnimatedButton>
                    </div>
                    <div>
                        <AnimatedButton onClick={handleLogout} color="blue" className="text-xs">
                            LOGOUT()
                        </AnimatedButton>
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                        {new Date().toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        }).replace(/\//g, '/')}
                    </div>
                </div>
            </header>

            <div className="mb-8 panel p-4 mx-auto w-full max-w-6xl relative overflow-x-hidden">
                <h2 className="text-xl font-bold mb-6 font-mono text-blue">DATA_VISUALIZATION</h2>

                {isLoading && (
                    <div className="h-64 flex items-center justify-center">
                        <div className="loader loader-blue"></div>
                    </div>
                )}

                {error && (
                    <div className="p-4 border-2 border-red-500 text-red-500 font-mono">
                        {error}
                    </div>
                )}

                {!isLoading && !error && analysisData && (
                    <div className="space-y-12">
                        {/* Marks Distribution Line Chart */}
                        <div className="panel panel-highlight p-6">
                            <div className="absolute -top-5 left-4 text-xs font-mono text-gray-500">// MARKS_DISTRIBUTION</div>
                            <h3 className="text-lg font-bold mb-6 font-mono text-lime">MARKS_DISTRIBUTION_ACROSS_SUBJECTS</h3>
                            <div className="h-80">
                                <Line data={prepareDistributionChartData() || { labels: [], datasets: [] }} options={lineOptions} />
                            </div>
                        </div>

                        {/* TA Performance Bar Charts */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-16 mx-auto w-full">
                            <div className="panel panel-highlight p-4 md:p-6 relative">
                                <div className="absolute -top-5 left-4 text-xs font-mono text-gray-500">// POLITICAL_SCIENCE_TA_PERFORMANCE</div>
                                <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 font-mono text-lime">POLITICAL_SCIENCE_TAs</h3>
                                <div className="h-64">
                                    <Bar
                                        data={prepareTAChartData('Political Science') || { labels: [], datasets: [] }}
                                        options={barOptions}
                                    />
                                </div>
                            </div>
                            <div className="panel panel-tertiary p-4 md:p-6 relative">
                                <div className="absolute -top-5 left-4 text-xs font-mono text-gray-500">// HISTORY_TA_PERFORMANCE</div>
                                <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 font-mono text-orange">HISTORY_TAs</h3>
                                <div className="h-64">
                                    <Bar
                                        data={prepareTAChartData('History') || { labels: [], datasets: [] }}
                                        options={barOptions}
                                    />
                                </div>
                            </div>
                            <div className="panel panel-secondary p-4 md:p-6 relative">
                                <div className="absolute -top-5 left-4 text-xs font-mono text-gray-500">// ECONOMICS_TA_PERFORMANCE</div>
                                <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 font-mono text-blue">ECONOMICS_TAs</h3>
                                <div className="h-64">
                                    <Bar
                                        data={prepareTAChartData('Economics') || { labels: [], datasets: [] }}
                                        options={barOptions}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Individual TA Performance Across Subjects */}
                        <div className="panel panel-highlight p-4 md:p-6 relative mb-8 md:mb-16">
                            <div className="absolute -top-5 left-4 text-xs font-mono text-gray-500">// TA_SUBJECT_PERFORMANCE</div>
                            <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 font-mono text-lime">TA_PERFORMANCE_ACROSS_SUBJECTS</h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                                {getUniqueTAs().map((taName, index) => (
                                    <div key={index} className="panel p-4 relative">
                                        <div className="absolute -top-3 left-4 text-xs font-mono text-gray-500">// {taName.toUpperCase()}</div>
                                        <h4 className="text-md font-bold mb-4 font-mono">{taName}</h4>
                                        <div className="h-56">
                                            <Bar
                                                data={prepareTAPerformanceAcrossSubjects(taName) || { labels: [], datasets: [] }}
                                                options={{
                                                    ...barOptions,
                                                    plugins: {
                                                        ...barOptions.plugins,
                                                        legend: {
                                                            display: true,
                                                            position: 'top',
                                                            labels: {
                                                                font: {
                                                                    family: 'JetBrains Mono',
                                                                },
                                                                color: 'rgba(255, 255, 255, 0.7)',
                                                            },
                                                        },
                                                    },
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

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