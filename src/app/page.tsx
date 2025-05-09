"use client";

import CasLogin from "@/components/CasLogin";
import { useState, useEffect } from "react";

export default function Home() {
  const [loading, setLoading] = useState(true);

  // Simulate page loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading ? (
        <div className="loading-screen">
          <div className="loader"></div>
        </div>
      ) : (
        <div className="flex flex-col min-h-screen p-4 md:p-8 relative">
          <div className="absolute top-4 md:top-8 left-4 md:left-8 text-xs text-gray-500 font-mono">
            IHS_ANALYZER.v1.0
          </div>

          <main className="flex-grow flex flex-col items-center justify-center pt-12 md:pt-16">
            <div className="panel p-6 md:p-8 max-w-xl w-full mb-8 relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-lime"></div>
              <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-blue"></div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 text-lime font-mono">
                IHS_MARKS<span className="text-blue">_ANALYZER</span>
              </h1>

              <hr className="border-t-2 border-gray-medium mb-6 md:mb-8" />

              <p className="text-base md:text-lg mb-6 md:mb-8 font-sans tracking-wide">
                Track and analyze your academic performance across
                <span className="text-lime"> Political Science</span>,
                <span className="text-orange"> History</span>, and
                <span className="text-blue"> Economics</span>,
                <span className="text-gold"> Sociology</span>, and
                <span className="text-pink"> Philosophy</span>.
              </p>

              <CasLogin />
            </div>
          </main>

          <footer className="py-8 text-center">
            <div className="flex justify-center items-center space-x-8">
              <div className="h-px w-16 bg-gray-medium"></div>
              <p className="text-gray-500 text-xs font-mono">
                © {new Date().getFullYear()} // IHS_MARKS_ANALYZER
              </p>
              <div className="h-px w-16 bg-gray-medium"></div>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}
