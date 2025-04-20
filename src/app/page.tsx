import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="glassmorphism p-8 max-w-xl w-full">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 glow-effect bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          IHS Marks Analyzer
        </h1>

        <p className="text-lg mb-8 text-gray-300">
          Track and analyze your academic performance across Political Science, History, and Economics
        </p>

        <Link href="/dashboard">
          <button className="px-8 py-3 text-lg font-medium rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition duration-300 transform hover:scale-105 neon-border">
            Login with CAS
          </button>
        </Link>
      </div>

      <footer className="absolute bottom-4 text-gray-500 text-sm">
        © {new Date().getFullYear()} IHS Marks Analyzer. All rights reserved.
      </footer>
    </div>
  );
}
