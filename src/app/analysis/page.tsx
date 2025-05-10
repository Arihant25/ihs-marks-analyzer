"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import AnimatedButton from "@/components/AnimatedButton";
import RotateDevicePrompt from "@/components/RotateDevicePrompt";
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
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

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
  branchAverages: {
    branch: string;
    subjects: {
      subject: string;
      averageMarks: number;
      count: number;
    }[];
  }[];
  studentMarks: Record<string, Record<string, number>>;
};

export default function Analysis() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const [pageLoading, setPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
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

  // Refresh data handler
  const handleRefresh = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/analysis");
      if (!response.ok) {
        throw new Error("Failed to fetch analysis data");
      }
      const data = await response.json();
      setAnalysisData(data);
    } catch (err) {
      console.error("Error refreshing analysis data:", err);
      setError("ERROR: FAILED_TO_REFRESH_DATA");
    } finally {
      setIsLoading(false);
    }
  };

  // Colors for subjects - Updated History to orange
  const subjectColors = {
    "Political Science": "rgba(191, 255, 0, 0.8)", // lime
    History: "rgba(255, 122, 0, 0.8)", // orange (changed from white)
    Economics: "rgba(0, 224, 255, 0.8)", // blue
    Sociology: "rgba(255, 215, 0, 0.8)", // gold (updated from #00ff7f)
    Philosophy: "rgba(255, 0, 127, 0.8)", // pink (updated from #ff007f)
  };

  const borderColors = {
    "Political Science": "rgb(191, 255, 0)",
    History: "rgb(255, 122, 0)", // orange (changed from white)
    Economics: "rgb(0, 224, 255)",
    Sociology: "rgb(255, 215, 0)", // gold (updated from #00ff7f)
    Philosophy: "rgb(255, 0, 127)", // pink (updated from #ff007f)
  };

  // Colors for branches
  const branchColors = {
    CSD: "rgba(255, 0, 127, 0.8)", // hot pink
    CSE: "rgba(191, 255, 0, 0.8)", // lime
    ECE: "rgba(0, 224, 255, 0.8)", // blue
    ECD: "rgba(255, 215, 0, 0.8)", // gold
    CND: "rgba(138, 43, 226, 0.8)", // purple
    CLD: "rgba(255, 122, 0, 0.8)", // orange
    Unknown: "rgba(169, 169, 169, 0.8)", // gray
  };

  const branchBorderColors = {
    CSD: "rgb(255, 0, 127)",
    CSE: "rgb(191, 255, 0)",
    ECE: "rgb(0, 224, 255)",
    ECD: "rgb(255, 215, 0)",
    CND: "rgb(138, 43, 226)",
    CLD: "rgb(255, 122, 0)",
    Unknown: "rgb(169, 169, 169)",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/analysis");

        if (!response.ok) {
          throw new Error("Failed to fetch analysis data");
        }

        const data = await response.json();
        setAnalysisData(data);
      } catch (err) {
        console.error("Error fetching analysis data:", err);
        setError("ERROR: FAILED_TO_FETCH_DATA");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate average marks per subject
  const calculateAverageMarksPerSubject = () => {
    if (!analysisData) return {};

    const subjectTotals: Record<string, { total: number; count: number }> = {};

    // Calculate totals and counts for each subject
    analysisData.averageMarksByTA.forEach((item) => {
      if (!subjectTotals[item.subject]) {
        subjectTotals[item.subject] = { total: 0, count: 0 };
      }
      subjectTotals[item.subject].total += item.averageMarks * item.count;
      subjectTotals[item.subject].count += item.count;
    });

    // Calculate averages
    const averages: Record<string, number> = {};
    for (const subject in subjectTotals) {
      averages[subject] = parseFloat(
        (subjectTotals[subject].total / subjectTotals[subject].count).toFixed(2)
      );
    }

    return averages;
  };

  // Get total student count per subject
  const getStudentCountPerSubject = () => {
    if (!analysisData) return {};

    const counts: Record<string, number> = {};

    analysisData.averageMarksByTA.forEach((item) => {
      if (!counts[item.subject]) {
        counts[item.subject] = 0;
      }
      counts[item.subject] += item.count;
    });

    return counts;
  };

  // Prepare data for TA Performance chart (bar chart)
  const prepareTAChartData = (subject: string) => {
    if (!analysisData) return { labels: [], datasets: [] };

    const subjectData = analysisData.averageMarksByTA.filter(
      (item) => item.subject === subject
    );

    // If no data exists for this subject, return empty chart data
    if (subjectData.length === 0) return { labels: [], datasets: [] };

    return {
      labels: subjectData.map((item) => item.taName),
      datasets: [
        {
          data: subjectData.map((item) => item.averageMarks),
          backgroundColor: subjectColors[subject as keyof typeof subjectColors],
          borderColor: borderColors[subject as keyof typeof borderColors],
          borderWidth: 2,
          // Store the student count data for tooltips
          studentCounts: subjectData.map((item) => item.count),
        },
      ],
    };
  };

  // Prepare data for Marks Distribution chart (line chart)
  const prepareDistributionChartData = () => {
    if (!analysisData) return { labels: [], datasets: [] };

    // Create bins with more reasonable increments (0, 1, 2, ..., 30)
    // This reduces the number of ticks and improves readability
    const allMarks = Array.from({ length: 31 }, (_, i) => i);

    // Create datasets for each subject
    const datasets = Object.keys(subjectColors).map((subject) => {
      // Get distribution data for this subject
      const subjectData = analysisData.marksDistribution.filter(
        (item) => item.subject === subject
      );

      // Create an array of counts for each mark bin
      const counts = allMarks.map((mark) => {
        // For each bin, find all marks that fall within 0.5 of this mark
        // e.g., bin 7 contains marks from 6.5 to 7.49
        const marksInBin = subjectData.filter(
          (item) => item.marks >= mark - 0.5 && item.marks < mark + 0.5
        );
        return marksInBin.reduce((sum, item) => sum + item.count, 0);
      });

      return {
        label: subject,
        data: counts,
        borderColor: borderColors[subject as keyof typeof borderColors],
        backgroundColor: subjectColors[subject as keyof typeof subjectColors],
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 4,
      };
    });

    return {
      labels: allMarks.map((mark) => mark.toString()),
      datasets,
    };
  };

  // Prepare data for branch-wise averages chart
  const prepareBranchAveragesChartData = () => {
    if (!analysisData || !analysisData.branchAverages)
      return { labels: [], datasets: [] };

    // Get filtered branches (excluding Unknown)
    const filteredBranches = analysisData.branchAverages.filter(
      (branch) => branch.branch !== "Unknown"
    );

    // If no valid branches, return empty chart data
    if (filteredBranches.length === 0) return { labels: [], datasets: [] };

    // Calculate total student count for each branch
    const branchStudentCounts = filteredBranches.map((branchData) =>
      branchData.subjects.reduce((total, subject) => total + subject.count, 0)
    );

    // For each branch, calculate the average total marks
    // Total marks = 2/3 * (sum of marks in all subjects)
    return {
      labels: filteredBranches.map((branchData) => branchData.branch),
      datasets: [
        {
          data: filteredBranches.map((branchData) => {
            // Sum up marks across all subjects
            const totalSubjectMarks = branchData.subjects.reduce(
              (total, subject) => total + subject.averageMarks,
              0
            );
            // Apply the 2/3 factor and round to 2 decimal places
            return parseFloat(((2 / 3) * totalSubjectMarks).toFixed(2));
          }),
          backgroundColor: filteredBranches.map(
            (branchData) =>
              branchColors[branchData.branch as keyof typeof branchColors] ||
              branchColors["Unknown"]
          ),
          borderColor: filteredBranches.map(
            (branchData) =>
              branchBorderColors[
              branchData.branch as keyof typeof branchBorderColors
              ] || branchBorderColors["Unknown"]
          ),
          borderWidth: 2,
          // Store student counts for tooltips
          studentCounts: branchStudentCounts,
        },
      ],
    };
  };

  // Prepare data for individual branch performance for a specific subject
  const prepareBranchSubjectPerformanceData = (subject: string) => {
    if (!analysisData || !analysisData.branchAverages)
      return { labels: [], datasets: [] };

    const filteredBranches = analysisData.branchAverages
      .filter((branch) => branch.branch !== "Unknown") // Exclude Unknown branch
      .map((branchData) => {
        const subjectData = branchData.subjects.find(
          (s) => s.subject === subject
        );
        return {
          branch: branchData.branch,
          averageMarks: subjectData ? subjectData.averageMarks : 0,
          count: subjectData ? subjectData.count : 0,
        };
      });

    // If no valid branches, return empty chart data
    if (filteredBranches.length === 0) return { labels: [], datasets: [] };

    return {
      labels: filteredBranches.map((b) => b.branch),
      datasets: [
        {
          data: filteredBranches.map((b) => b.averageMarks),
          backgroundColor: filteredBranches.map(
            (b) =>
              branchColors[b.branch as keyof typeof branchColors] ||
              branchColors["Unknown"]
          ),
          borderColor: filteredBranches.map(
            (b) =>
              branchBorderColors[b.branch as keyof typeof branchBorderColors] ||
              branchBorderColors["Unknown"]
          ),
          borderWidth: 2,
          // Store branch data for tooltips
          branchData: filteredBranches,
        },
      ],
    };
  };

  // Prepare data for individual TA performance across subjects (bar chart)
  const prepareTAPerformanceAcrossSubjects = (taName: string) => {
    if (!analysisData) return { labels: [], datasets: [] };

    const taData = analysisData.averageMarksByTA.filter(
      (item) => item.taName === taName
    );

    // If no data exists for this TA, return empty chart data
    if (taData.length === 0) return { labels: [], datasets: [] };

    return {
      labels: taData.map((item) => item.subject),
      datasets: [
        {
          data: taData.map((item) => item.averageMarks),
          backgroundColor: taData.map(
            (item) => subjectColors[item.subject as keyof typeof subjectColors]
          ),
          borderColor: taData.map(
            (item) => borderColors[item.subject as keyof typeof borderColors]
          ),
          borderWidth: 2,
          // Store TA data for tooltips
          taData: taData,
        },
      ],
    };
  };

  // Get unique TA names
  const getUniqueTAs = () => {
    if (!analysisData) return [];

    const taNames = analysisData.averageMarksByTA.map((item) => item.taName);
    return [...new Set(taNames)];
  };

  // Calculate average course total
  const calculateAverageCourseTotal = () => {
    if (!analysisData || !analysisData.studentMarks) return { average: 0, count: 0 };

    // Get all subjects
    const subjects = Object.keys(subjectColors);

    // Calculate total marks for each student
    const studentTotals: number[] = [];

    // Process actual student data from the API
    Object.entries(analysisData.studentMarks).forEach(([rollNumber, subjectMarks]) => {
      // Sum all subject marks for this student
      let totalMarks = 0;
      let subjectCount = 0;

      subjects.forEach(subject => {
        if (subjectMarks[subject]) {
          totalMarks += subjectMarks[subject];
          subjectCount++;
        }
      });

      // Only include students who have marks for all subjects
      if (subjectCount === subjects.length) {
        // Apply 2/3 factor and add to student totals
        studentTotals.push(totalMarks * 2 / 3);
      }
    });

    // Calculate the average of all student totals
    const totalSum = studentTotals.reduce((sum, total) => sum + total, 0);
    const average = studentTotals.length > 0 ? parseFloat((totalSum / studentTotals.length).toFixed(2)) : 0;

    return {
      average,
      count: studentTotals.length
    };
  };

  // Function to prepare data for Total Marks distribution (grading curve)
  const prepareTotalMarksChartData = () => {
    if (!analysisData || !analysisData.studentMarks) return { labels: [], datasets: [] };

    // Get all subjects
    const subjects = Object.keys(subjectColors);

    // Calculate total marks for each student
    const studentTotals: number[] = [];

    // Process actual student data from the API
    Object.entries(analysisData.studentMarks).forEach(([rollNumber, subjectMarks]) => {
      // Sum all subject marks for this student
      let totalMarks = 0;
      let subjectCount = 0;

      subjects.forEach(subject => {
        if (subjectMarks[subject]) {
          totalMarks += subjectMarks[subject];
          subjectCount++;
        }
      });

      // Only include students who have marks for all subjects
      if (subjectCount === subjects.length) {
        // Apply 2/3 factor and add to student totals
        studentTotals.push(totalMarks * 2 / 3);
      }
    });

    // Round to nearest integer for better visualization
    const roundedTotals = studentTotals.map(total => Math.round(total));

    // Create frequency distribution (how many students got each total)
    const distribution: Record<number, number> = {};
    roundedTotals.forEach(total => {
      if (!distribution[total]) {
        distribution[total] = 0;
      }
      distribution[total]++;
    });

    // Create array of distinct totals, sorted
    const sortedTotals = Object.keys(distribution)
      .map(Number)
      .sort((a, b) => a - b);

    // If no totals found, return empty chart
    if (sortedTotals.length === 0) return { labels: [], datasets: [] };

    // Define the range of totals to show (min to max)
    const minTotal = Math.min(...sortedTotals);
    const maxTotal = Math.max(...sortedTotals);

    // Create labels for each possible total in the range
    const labels = Array.from(
      { length: maxTotal - minTotal + 1 },
      (_, i) => (minTotal + i).toString()
    );

    // Create data array with counts for each total
    const data = labels.map(label => distribution[parseInt(label)] || 0);

    return {
      labels,
      datasets: [
        {
          label: "",
          data,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 5,
        }
      ],
    };
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
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          family: "JetBrains Mono",
        },
        bodyFont: {
          family: "JetBrains Mono",
        },
        callbacks: {
          afterBody: function (context: any) {
            const dataIndex = context[0].dataIndex;
            const datasetIndex = context[0].datasetIndex;
            const dataset = context[0].chart.data.datasets[datasetIndex];

            // For TA Performance chart
            if (dataset.studentCounts) {
              return `Data Points: ${dataset.studentCounts[dataIndex]}`;
            }

            // For branch subject performance charts
            if (dataset.branchData) {
              return `Data Points: ${dataset.branchData[dataIndex].count}`;
            }

            // For TA performance across subjects
            if (dataset.taData) {
              return `Data Points: ${dataset.taData[dataIndex].count}`;
            }

            return "";
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 30,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          font: {
            family: "JetBrains Mono",
          },
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "JetBrains Mono",
          },
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            family: "JetBrains Mono",
          },
          color: "rgba(255, 255, 255, 0.7)",
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          family: "JetBrains Mono",
        },
        bodyFont: {
          family: "JetBrains Mono",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Data Points",
          font: {
            family: "JetBrains Mono",
          },
          color: "rgba(255, 255, 255, 0.7)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          font: {
            family: "JetBrains Mono",
          },
          color: "rgba(255, 255, 255, 0.7)",
          // Ensure student count is always displayed as integers
          callback: function (value: any) {
            if (Math.floor(value) === value) {
              return value;
            }
            return "";
          },
        },
      },
      x: {
        title: {
          display: true,
          text: "Marks (0-30)",
          font: {
            family: "JetBrains Mono",
          },
          color: "rgba(255, 255, 255, 0.7)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          font: {
            family: "JetBrains Mono",
          },
          color: "rgba(255, 255, 255, 0.7)",
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 15, // Limit the number of ticks to improve readability
        },
      },
    },
  };

  const branchOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            family: "JetBrains Mono",
          },
          color: "rgba(255, 255, 255, 0.7)",
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          family: "JetBrains Mono",
        },
        bodyFont: {
          family: "JetBrains Mono",
        },
        callbacks: {
          afterBody: function (context: any) {
            const dataIndex = context[0].dataIndex;
            const datasetIndex = context[0].datasetIndex;
            const dataset = context[0].chart.data.datasets[datasetIndex];

            if (dataset.studentCounts) {
              return `Data Points: ${dataset.studentCounts[dataIndex]}`;
            }

            return "";
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 30,
        title: {
          display: true,
          text: "Average Marks",
          font: {
            family: "JetBrains Mono",
          },
          color: "rgba(255, 255, 255, 0.7)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          font: {
            family: "JetBrains Mono",
          },
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "JetBrains Mono",
          },
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
    },
  };  // Function to check if student has data for all subjects
  const hasCompleteData = () => {
    if (!analysisData || !analysisData.studentMarks || !session?.user?.rollNumber) return false;

    // Get all subjects
    const subjects = Object.keys(subjectColors);

    // Get the current user's roll number
    const currentUserRollNumber = session.user.rollNumber;

    // Check if the current user's data exists
    if (!analysisData.studentMarks[currentUserRollNumber]) return false;

    // Check if the current user has marks for all subjects
    const userMarks = analysisData.studentMarks[currentUserRollNumber];
    let completeData = true;

    subjects.forEach(subject => {
      if (userMarks[subject] === undefined) {
        completeData = false;
        console.log(`Current user is missing marks for ${subject}`);
      }
    });

    return completeData;
  };

  // Incomplete Data Overlay Component
  const IncompleteDataOverlay = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
      <div className="panel panel-highlight p-6 w-11/12 max-w-lg border-2 border-lime">
        <h2 className="text-xl md:text-2xl font-bold mb-4 font-mono text-lime">
          INCOMPLETE_DATA_WARNING
        </h2>
        <p className="font-mono text-white mb-6">
          Analysis requires complete data for all subjects to provide accurate results.
          Please upload marks for all subjects from the dashboard.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <AnimatedButton
            color="lime"
            onClick={() => router.push("/dashboard")}
          >
            GO_TO_DASHBOARD()
          </AnimatedButton>
          <AnimatedButton
            color="orange"
            onClick={handleRefresh}
          >
            REFRESH_DATA()
          </AnimatedButton>
        </div>
      </div>
    </div>
  );

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

      {/* Overlay for incomplete data */}
      {!isLoading && !error && analysisData && !hasCompleteData() && <IncompleteDataOverlay />}

      <header className="mb-8 md:mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-mono text-lime">
            IHS_ANALYZER<span className="text-xs text-gray-500 ml-2">v2.0</span>
          </h1>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div>
            <AnimatedButton color="lime" onClick={handleRefresh}>
              REFRESH_DATA()
            </AnimatedButton>
          </div>
          <div>
            <AnimatedButton
              color="orange"
              onClick={() => router.push("/dashboard")}
            >
              DASHBOARD()
            </AnimatedButton>
          </div>
          <div>
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
      </header>

      <div className="mb-8 panel p-4 mx-auto w-full max-w-6xl relative overflow-x-hidden">
        <h2 className="text-xl font-bold mb-12 font-mono text-blue">
          DATA_VISUALIZATION
        </h2>

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
            {/* Summary Cards Grid - Both Course Total and Subject Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-16 mx-auto w-full">
              {/* Course Total Summary Card */}
              <div className="panel panel-primary p-4 md:p-6 relative">
                <div className="absolute -top-5 left-4 text-xs font-mono text-gray-500">
                  // COURSE_TOTAL_SUMMARY
                </div>
                <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 font-mono text-white">
                  COURSE_TOTAL
                </h3>
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-mono text-gray-300">
                      AVG_COURSE_TOTAL:
                    </span>
                    <span className="text-2xl font-bold font-mono">
                      {calculateAverageCourseTotal().average}
                    </span>
                  </div>
                  <div className="h-px w-full bg-gray-medium my-2"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-mono text-gray-300">
                      Data Points:
                    </span>
                    <span className="text-xl font-bold font-mono">
                      {calculateAverageCourseTotal().count}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject Summary Cards */}
              {Object.entries(calculateAverageMarksPerSubject()).map(
                ([subject, averageMarks]) => {
                  const colorClass =
                    subject === "Political Science"
                      ? "panel-highlight text-lime"
                      : subject === "History"
                        ? "panel-tertiary text-orange"
                        : subject === "Economics"
                          ? "panel-secondary text-blue"
                          : subject === "Sociology"
                            ? "panel-gold text-gold" // Updated to gold
                            : subject === "Philosophy"
                              ? "panel-pink text-pink" // Updated to pink
                              : "panel-gray text-gray-500";
                  return (
                    <div
                      key={subject}
                      className={`panel ${colorClass} p-4 md:p-6 relative`}
                    >
                      <div className="absolute -top-5 left-4 text-xs font-mono text-gray-500">
                        // {subject.toUpperCase()}_SUMMARY
                      </div>
                      <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 font-mono">
                        {subject.replace(" ", "_")}
                      </h3>
                      <div className="flex flex-col space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-mono text-gray-300">
                            AVG_MARKS:
                          </span>
                          <span className="text-2xl font-bold font-mono">
                            {averageMarks}
                          </span>
                        </div>
                        <div className="h-px w-full bg-gray-medium my-2"></div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-mono text-gray-300">
                            Data Points:
                          </span>
                          <span className="text-xl font-bold font-mono">
                            {getStudentCountPerSubject()[subject]}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {/* Total Marks Graph */}
            <div className="panel panel-highlight p-6 relative">
              <div className="absolute -top-5 left-4 text-xs font-mono text-gray-500">
                // Course total distribution
              </div>
              <h3 className="text-lg font-bold mb-6 font-mono text-lime">
                COURSE_TOTAL_DISTRIBUTION
              </h3>
              <div className="h-80">
                <Line
                  data={
                    prepareTotalMarksChartData() || {
                      labels: [],
                      datasets: [],
                    }
                  }
                  options={{
                    ...lineOptions,
                    plugins: {
                      ...lineOptions.plugins,
                      legend: {
                        ...lineOptions.plugins.legend,
                        display: false, // Hide legend since we're not showing labels
                      },
                    },
                    scales: {
                      ...lineOptions.scales,
                      x: {
                        title: {
                          display: true,
                          text: "Course Total",
                          font: {
                            family: "JetBrains Mono",
                          },
                          color: "rgba(255, 255, 255, 0.7)",
                        }
                      },
                      y: {
                        ...lineOptions.scales.y,
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "Number of Students",
                          font: {
                            family: "JetBrains Mono",
                          },
                          color: "rgba(255, 255, 255, 0.7)",
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Branch-wise Performance Visualization */}
            <div className="panel panel-highlight p-6 relative mb-8 md:mb-16">
              <div className="absolute -top-5 left-4 text-xs font-mono text-gray-500">
                // BRANCH_WISE_PERFORMANCE
              </div>
              <h3 className="text-lg font-bold mb-6 font-mono text-lime">
                BRANCH_WISE_COURSE_TOTAL
              </h3>
              <div className="h-80">
                <Bar
                  data={
                    prepareBranchAveragesChartData() || {
                      labels: [],
                      datasets: [],
                    }
                  }
                  options={{
                    ...branchOptions,
                    plugins: {
                      ...branchOptions.plugins,
                      legend: {
                        ...branchOptions.plugins.legend,
                        display: false, // Hide legend
                      },
                    },
                    scales: {
                      ...branchOptions.scales,
                      y: {
                        ...branchOptions.scales.y,
                        max: 100,
                        title: {
                          display: true,
                          text: "Average Course Total",
                          font: {
                            family: "JetBrains Mono",
                          },
                          color: "rgba(255, 255, 255, 0.7)",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Branch-wise Performance for Each Subject */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-16 mx-auto w-full">
              <div className="panel panel-highlight p-4 md:p-6 relative">
                <div className="absolute -top-5 left-4 text-xs font-mono text-gray-500">
                  // POLITICAL_SCIENCE_BRANCH_PERFORMANCE
                </div>
                <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 font-mono text-lime">
                  POLITICAL_SCIENCE_BRANCHES
                </h3>
                <div className="h-64">
                  <Bar
                    data={
                      prepareBranchSubjectPerformanceData(
                        "Political Science"
                      ) || { labels: [], datasets: [] }
                    }
                    options={barOptions}
                  />
                </div>
              </div>
              <div className="panel panel-tertiary p-4 md:p-6 relative">
                <div className="absolute -top-5 left-4 text-xs font-mono text-gray-500">
                  // HISTORY_BRANCH_PERFORMANCE
                </div>
                <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 font-mono text-orange">
                  HISTORY_BRANCHES
                </h3>
                <div className="h-64">
                  <Bar
                    data={
                      prepareBranchSubjectPerformanceData("History") || {
                        labels: [],
                        datasets: [],
                      }
                    }
                    options={barOptions}
                  />
                </div>
              </div>
              <div className="panel panel-secondary p-4 md:p-6 relative">
                <div className="absolute -top-5 left-4 text-xs font-mono text-gray-500">
                  // ECONOMICS_BRANCH_PERFORMANCE
                </div>
                <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 font-mono text-blue">
                  ECONOMICS_BRANCHES
                </h3>
                <div className="h-64">
                  <Bar
                    data={
                      prepareBranchSubjectPerformanceData("Economics") || {
                        labels: [],
                        datasets: [],
                      }
                    }
                    options={barOptions}
                  />
                </div>
              </div>
              <div className="panel panel-gold p-4 md:p-6 relative">
                {" "}
                <div className="absolute -top-5 left-4 text-xs font-mono text-gray-500">
                  // SOCIOLOGY_BRANCH_PERFORMANCE
                </div>
                <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 font-mono text-gold">
                  SOCIOLOGY_BRANCHES
                </h3>{" "}
                <div className="h-64">
                  <Bar
                    data={
                      prepareBranchSubjectPerformanceData("Sociology") || {
                        labels: [],
                        datasets: [],
                      }
                    }
                    options={barOptions}
                  />
                </div>
              </div>
              <div className="panel panel-pink p-4 md:p-6 relative">
                {" "}
                <div className="absolute -top-5 left-4 text-xs font-mono text-gray-500">
                  // PHILOSOPHY_BRANCH_PERFORMANCE
                </div>
                <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 font-mono text-pink">
                  PHILOSOPHY_BRANCHES
                </h3>{" "}
                <div className="h-64">
                  <Bar
                    data={
                      prepareBranchSubjectPerformanceData("Philosophy") || {
                        labels: [],
                        datasets: [],
                      }
                    }
                    options={barOptions}
                  />
                </div>
              </div>
            </div>

            {/* Marks Distribution Line Chart */}
            <div className="panel panel-highlight p-6 relative">
              <div className="absolute -top-5 left-4 text-xs font-mono text-gray-500">
                // MARKS_DISTRIBUTION
              </div>
              <h3 className="text-lg font-bold mb-6 font-mono text-lime">
                MARKS_DISTRIBUTION_ACROSS_SUBJECTS
              </h3>
              <div className="h-80">
                <Line
                  data={
                    prepareDistributionChartData() || {
                      labels: [],
                      datasets: [],
                    }
                  }
                  options={lineOptions}
                />
              </div>
            </div>

            {/* TA Performance Bar Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-16 mx-auto w-full">
              <div className="panel panel-highlight p-4 md:p-6 relative">
                <div className="absolute -top-5 left-4 text-xs font-mono text-gray-500">
                  // POLITICAL_SCIENCE_TA_PERFORMANCE
                </div>
                <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 font-mono text-lime">
                  POLITICAL_SCIENCE_TAs
                </h3>
                <div className="h-64">
                  <Bar
                    data={
                      prepareTAChartData("Political Science") || {
                        labels: [],
                        datasets: [],
                      }
                    }
                    options={barOptions}
                  />
                </div>
              </div>
              <div className="panel panel-tertiary p-4 md:p-6 relative">
                <div className="absolute -top-5 left-4 text-xs font-mono text-gray-500">
                  // HISTORY_TA_PERFORMANCE
                </div>
                <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 font-mono text-orange">
                  HISTORY_TAs
                </h3>
                <div className="h-64">
                  <Bar
                    data={
                      prepareTAChartData("History") || {
                        labels: [],
                        datasets: [],
                      }
                    }
                    options={barOptions}
                  />
                </div>
              </div>
              <div className="panel panel-secondary p-4 md:p-6 relative">
                <div className="absolute -top-5 left-4 text-xs font-mono text-gray-500">
                  // ECONOMICS_TA_PERFORMANCE
                </div>
                <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 font-mono text-blue">
                  ECONOMICS_TAs
                </h3>
                <div className="h-64">
                  <Bar
                    data={
                      prepareTAChartData("Economics") || {
                        labels: [],
                        datasets: [],
                      }
                    }
                    options={barOptions}
                  />
                </div>
              </div>
              <div className="panel panel-gold p-4 md:p-6 relative">
                {" "}
                {/* Updated to gold panel */}
                <div className="absolute -top-5 left-4 text-xs font-mono text-gray-500">
                  // SOCIOLOGY_TA_PERFORMANCE
                </div>
                <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 font-mono text-gold">
                  SOCIOLOGY_TAs
                </h3>{" "}
                {/* Updated to gold text */}
                <div className="h-64">
                  <Bar
                    data={
                      prepareTAChartData("Sociology") || {
                        labels: [],
                        datasets: [],
                      }
                    }
                    options={barOptions}
                  />
                </div>
              </div>
              <div className="panel panel-pink p-4 md:p-6 relative">
                {" "}
                {/* Updated to pink panel */}
                <div className="absolute -top-5 left-4 text-xs font-mono text-gray-500">
                  // PHILOSOPHY_TA_PERFORMANCE
                </div>
                <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 font-mono text-pink">
                  PHILOSOPHY_TAs
                </h3>{" "}
                {/* Updated to pink text */}
                <div className="h-64">
                  <Bar
                    data={
                      prepareTAChartData("Philosophy") || {
                        labels: [],
                        datasets: [],
                      }
                    }
                    options={barOptions}
                  />
                </div>
              </div>
            </div>

            {/* Individual TA Performance Across Subjects */}
            <div className="panel panel-highlight p-4 md:p-6 relative mb-8 md:mb-16">
              <div className="absolute -top-5 left-4 text-xs font-mono text-gray-500">
                // TA_SUBJECT_PERFORMANCE
              </div>
              <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 font-mono text-lime">
                TA_PERFORMANCE_ACROSS_SUBJECTS
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                {getUniqueTAs().map((taName, index) => (
                  <div key={index} className="panel p-4 relative">
                    <div className="absolute -top-3 left-4 text-xs font-mono text-gray-500">
                      // {taName.toUpperCase()}
                    </div>
                    <h4 className="text-md font-bold mb-4 font-mono">
                      {taName}
                    </h4>
                    <div className="h-56">
                      <Bar
                        data={
                          prepareTAPerformanceAcrossSubjects(taName) || {
                            labels: [],
                            datasets: [],
                          }
                        }
                        options={{
                          ...barOptions,
                          plugins: {
                            ...barOptions.plugins,
                            legend: {
                              ...barOptions.plugins.legend,
                              display: false, // Hide legend
                            },
                            tooltip: {
                              ...barOptions.plugins.tooltip,
                              callbacks: {
                                ...barOptions.plugins.tooltip.callbacks,
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
