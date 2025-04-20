import React, { useEffect, useState } from 'react';

interface RotateDevicePromptProps {
    className?: string;
}

export default function RotateDevicePrompt({ className = '' }: RotateDevicePromptProps) {
    const [isPortrait, setIsPortrait] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Check if device is in portrait mode and is small screen (phone)
    useEffect(() => {
        const checkOrientation = () => {
            // Only show on small screens (phones)
            if (window.innerWidth < 768) {
                const isPortraitMode = window.innerHeight > window.innerWidth;
                setIsPortrait(isPortraitMode);
                setIsVisible(isPortraitMode);
            } else {
                setIsVisible(false);
            }
        };

        // Check on mount
        checkOrientation();

        // Check on orientation change and resize
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);

        return () => {
            window.removeEventListener('resize', checkOrientation);
            window.removeEventListener('orientationchange', checkOrientation);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center p-6 ${className}`}>
            <div className="flex flex-col items-center space-y-6">
                <h2 className="text-xl font-bold font-mono text-lime text-center">ROTATE_YOUR_DEVICE</h2>
                <p className="text-sm text-gray-300 font-mono text-center">
                    For better visualization of charts, please rotate your device to landscape mode.
                </p>

                {/* Rotation animation */}
                <div className="relative w-40 h-40 my-4">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-20 border-2 border-lime rounded-lg flex items-center justify-center animate-pulse">
                            <svg className="w-12 h-12 text-lime animate-spin-slow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16v16H4z"></path>
                                <path d="M9 2v4"></path>
                                <path d="M15 2v4"></path>
                                <path d="M9 18v4"></path>
                                <path d="M15 18v4"></path>
                                <path d="M2 9h4"></path>
                                <path d="M2 15h4"></path>
                                <path d="M18 9h4"></path>
                                <path d="M18 15h4"></path>
                            </svg>
                        </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center transform rotate-90 opacity-70">
                        <div className="w-20 h-32 border-2 border-lime rounded-lg"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 border-2 border-blue rounded-full flex items-center justify-center animate-rotate">
                            <svg className="w-6 h-6 text-blue" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"></path>
                                <path d="M12 3v9l4 4"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-gray-500 font-mono animate-pulse">
          // CHARTS_OPTIMIZED_FOR_LANDSCAPE
                </p>
            </div>
        </div>
    );
}