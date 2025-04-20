"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import SubjectBox from "@/components/SubjectBox";
import AnimatedButton from "@/components/AnimatedButton";
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  const [notification, setNotification] = React.useState({
    message: "",
    type: "",
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [pageLoading, setPageLoading] = React.useState(true);

  // Simulate initial page loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleSubjectSubmit = async (
    subject: string,
    data: { taName: string; marks: number }
  ) => {
    // Use the roll number from the session
    if (!session?.user?.rollNumber) {
      setNotification({
        message: "ERROR: USER_SESSION_INVALID",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/marks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rollNumber: session.user.rollNumber,
          subject,
          taName: data.taName,
          marks: data.marks,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setNotification({
          message: `SUCCESS: ${subject.toUpperCase()}_MARKS_SUBMITTED`,
          type: "success",
        });
      } else {
        setNotification({
          message: `ERROR: ${result.error || "SUBMISSION_FAILED"}`,
          type: "error",
        });
      }
    } catch (error) {
      setNotification({
        message: "ERROR: CONNECTION_FAILED",
        type: "error",
      });
    } finally {
      setIsLoading(false);

      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification({ message: "", type: "" });
      }, 3000);
    }
  };

  if (status === "loading" || pageLoading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-8">
      <header className="mb-16 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold font-mono text-lime">
            IHS_ANALYZER<span className="text-xs text-gray-500 ml-2">v1.0</span>
          </h1>
          <div className="ml-8">
            <AnimatedButton 
              onClick={() => router.push('/analysis')} 
              color="lime"
            >
              VIEW_ANALYSIS()
            </AnimatedButton>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-gray-500 font-mono">
            {new Date().toISOString().split("T")[0].replace(/-/g, "/")}
          </div>
          <AnimatedButton
            onClick={handleLogout}
            color="blue"
            className="text-xs"
          >
            LOGOUT()
          </AnimatedButton>
        </div>
      </header>

      <div className="mb-8 panel p-4 mx-auto w-full max-w-md relative">
        <div className="absolute -top-2 right-4 text-xs text-blue font-mono">
          // USER_IDENTIFICATION
        </div>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-300 font-mono mb-1">WELCOME:</div>
            <div className="font-bold text-lime">
              {session.user?.name || "USER"}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-300 font-mono mb-1">
              ROLL_NUMBER:
            </div>
            <div className="font-bold text-blue">
              {session.user?.rollNumber || "UNKNOWN"}
            </div>
          </div>
        </div>
      </div>

      {notification.message && (
        <div
          className={`mb-8 p-4 mx-auto w-full max-w-md font-mono text-sm border-2 ${
            notification.type === "success"
              ? "border-lime text-lime"
              : "border-red-500 text-red-500"
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="grid-asymmetric mb-16 mx-auto w-full max-w-6xl">
        <SubjectBox
          title="Political Science"
          onSubmit={(data) => handleSubjectSubmit("Political Science", data)}
          color="lime"
        />
        <SubjectBox
          title="History"
          onSubmit={(data) => handleSubjectSubmit("History", data)}
          color="orange"
        />
        <SubjectBox
          title="Economics"
          onSubmit={(data) => handleSubjectSubmit("Economics", data)}
          color="blue"
        />
      </div>

      {isLoading && (
        <div className="loading-screen">
          <div className="loader"></div>
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
