"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import SubjectBox from "@/components/SubjectBox";
import AnimatedButton from "@/components/AnimatedButton";
import { useRouter } from "next/navigation";

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
  const [subjectMarks, setSubjectMarks] = React.useState<
    Record<string, number>
  >({});
  const [subjectTAs, setSubjectTAs] = React.useState<Record<string, string>>(
    {}
  );

  // Fetch initial marks and TA for all subjects
  React.useEffect(() => {
    const fetchMarksForSubject = async (subject: string) => {
      if (session?.user?.rollNumber) {
        try {
          const response = await fetch(
            `/api/marks?rollNumber=${
              session.user.rollNumber
            }&subject=${encodeURIComponent(subject)}`
          );
          if (response.ok) {
            const data = await response.json();
            setSubjectMarks((prevMarks) => ({
              ...prevMarks,
              [subject]: data.marks,
            }));
            setSubjectTAs((prevTAs) => ({
              ...prevTAs,
              [subject]: data.taName,
            }));
          } else {
            console.error(`Failed to fetch marks for ${subject}`);
            setSubjectMarks((prevMarks) => ({ ...prevMarks, [subject]: 0 }));
            setSubjectTAs((prevTAs) => ({ ...prevTAs, [subject]: "Tanveer" }));
          }
        } catch (error) {
          console.error(`Error fetching marks for ${subject}:`, error);
          setSubjectMarks((prevMarks) => ({ ...prevMarks, [subject]: 0 }));
          setSubjectTAs((prevTAs) => ({ ...prevTAs, [subject]: "Tanveer" }));
        }
      }
    };

    const subjects = [
      "Political Science",
      "History",
      "Economics",
      "Sociology",
      "Philosophy",
    ];

    const fetchAll = async () => {
      await Promise.all(subjects.map(fetchMarksForSubject));
      setPageLoading(false);
    };

    if (session?.user?.rollNumber) {
      fetchAll();
    }
  }, [session]);

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
    <div className="min-h-screen flex flex-col p-4 md:p-8">
      <header className="mb-8 md:mb-16">
        <div className="w-full flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl md:text-3xl font-bold font-mono text-lime">
              IHS_ANALYZER
              <span className="text-xs text-gray-500 ml-2">v1.0</span>
            </h1>
            <div className="md:hidden w-full flex justify-center">
              <AnimatedButton
                onClick={() => router.push("/analysis")}
                color="orange"
              >
                VIEW_ANALYSIS()
              </AnimatedButton>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="hidden md:block">
              <AnimatedButton
                onClick={() => router.push("/analysis")}
                color="orange"
              >
                VIEW_ANALYSIS()
              </AnimatedButton>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="ml-auto">
                <AnimatedButton
                  onClick={handleLogout}
                  color="blue"
                  className="text-xs"
                >
                  LOGOUT()
                </AnimatedButton>
              </div>
              <div className="text-xs text-gray-500 font-mono">
                {new Date()
                  .toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                  .replace(/\//g, "/")}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mb-8 panel p-4 mx-auto w-full max-w-md relative">
        <div className="absolute -top-2 right-4 text-xs text-pink font-mono">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-16 mx-auto w-full max-w-6xl">
        <SubjectBox
          title="Political Science"
          onSubmit={(data) => handleSubjectSubmit("Political Science", data)}
          color="lime"
          initialMarks={subjectMarks["Political Science"]}
          initialTA={subjectTAs["Political Science"]}
        />
        <SubjectBox
          title="History"
          onSubmit={(data) => handleSubjectSubmit("History", data)}
          color="orange"
          initialMarks={subjectMarks["History"]}
          initialTA={subjectTAs["History"]}
        />
        <SubjectBox
          title="Economics"
          onSubmit={(data) => handleSubjectSubmit("Economics", data)}
          color="blue"
          initialMarks={subjectMarks["Economics"]}
          initialTA={subjectTAs["Economics"]}
        />
        <SubjectBox
          title="Sociology"
          onSubmit={(data) => handleSubjectSubmit("Sociology", data)}
          color="gold"
          initialMarks={subjectMarks["Sociology"]}
          initialTA={subjectTAs["Sociology"]}
        />
        <SubjectBox
          title="Philosophy"
          onSubmit={(data) => handleSubjectSubmit("Philosophy", data)}
          color="pink"
          initialMarks={subjectMarks["Philosophy"]}
          initialTA={subjectTAs["Philosophy"]}
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
