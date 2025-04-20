"use client"
import { signOut } from 'next-auth/react';

export default function NotFound() {
    // Handle logout function
    const handleLogout = async () => {
        await signOut({ callbackUrl: "/" });
    };

    return (
        <div className="min-h-screen flex flex-col p-4 md:p-8">
            <header className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold font-mono text-lime">
                    IHS_ANALYZER<span className="text-xs text-gray-500 ml-2">v1.0</span>
                </h1>
            </header>

            <div className="flex-grow flex items-center justify-center">
                <div className="panel panel-tertiary p-8 max-w-lg w-full relative">
                    <div className="absolute -top-5 left-4 text-xs text-orange font-mono">
            // ERROR_403
                    </div>

                    <h2 className="text-3xl md:text-4xl font-mono text-orange mb-6">
                        NO_SNOOPING()
                    </h2>

                    <p className="text-gray-300 mb-8 font-mono">
                        ACCESS_DENIED: You are not authorized to view this page.
                    </p>

                    <div className="mt-8">
                        <button
                            onClick={handleLogout}
                            className="animated-button animated-button-blue"
                        >
                            <span className="circle"></span>
                            <span className="text">LOGOUT()</span>
                            <svg
                                viewBox="0 0 13 10"
                                height="10px"
                                width="15px"
                                className="arr-1"
                            >
                                <path d="M1,5 L11,5"></path>
                                <polyline points="8 1 12 5 8 9"></polyline>
                            </svg>
                            <svg
                                viewBox="0 0 13 10"
                                height="10px"
                                width="15px"
                                className="arr-2"
                            >
                                <path d="M1,5 L11,5"></path>
                                <polyline points="8 1 12 5 8 9"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
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