import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Marks from '@/models/Marks';

// Branch identification based on roll number patterns
function getBranchFromRollNumber(rollNumber: string): string {
    if (!rollNumber || typeof rollNumber !== 'string') return 'Unknown';

    // Extract the branch code part from the roll number
    // The pattern is XXXX[branch-code]XXX
    const match = rollNumber.match(/^\d{4}(\d{3})\d{3}$/);
    if (!match) return 'Unknown';

    const branchCode = match[1];

    switch (branchCode) {
        case '111': return 'CSD';
        case '101': return 'CSE';
        case '102': return 'ECE';
        case '112': return 'ECD';
        case '113': return 'CND';
        case '114': return 'CLD';
        default: return 'Unknown';
    }
}

export async function GET(request: NextRequest) {
    try {
        // Connect to the database
        await connectToDatabase();

        // Aggregate data for average marks by TA for each subject
        const averageMarksByTA = await Marks.aggregate([
            {
                $group: {
                    _id: { subject: "$subject", taName: "$taName" },
                    averageMarks: { $avg: "$marks" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.subject": 1, "_id.taName": 1 }
            }
        ]);

        // Aggregate data for marks distribution across all subjects
        // We're keeping the exact marks value to properly support decimal marks
        const marksDistribution = await Marks.aggregate([
            {
                $group: {
                    _id: { subject: "$subject", marks: "$marks" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.subject": 1, "_id.marks": 1 }
            }
        ]);

        // Get all marks data to calculate branch-wise averages
        const allMarks = await Marks.find({}).lean();

        // Group marks by branch and subject
        const branchData: Record<string, Record<string, { total: number, count: number }>> = {};

        allMarks.forEach(mark => {
            const branch = getBranchFromRollNumber(mark.rollNumber);

            if (!branchData[branch]) {
                branchData[branch] = {};
            }

            if (!branchData[branch][mark.subject]) {
                branchData[branch][mark.subject] = { total: 0, count: 0 };
            }

            branchData[branch][mark.subject].total += mark.marks;
            branchData[branch][mark.subject].count += 1;
        });

        // Format branch data for response
        const branchAverages = Object.entries(branchData).map(([branch, subjects]) => {
            const subjectAverages = Object.entries(subjects).map(([subject, data]) => ({
                subject,
                averageMarks: parseFloat((data.total / data.count).toFixed(2)),
                count: data.count
            }));

            return {
                branch,
                subjects: subjectAverages
            };
        });

        // Format the response data
        const formattedAveragesByTA = averageMarksByTA.map(item => ({
            subject: item._id.subject,
            taName: item._id.taName,
            averageMarks: parseFloat(item.averageMarks.toFixed(2)),
            count: item.count
        }));

        const formattedDistribution = marksDistribution.map(item => ({
            subject: item._id.subject,
            marks: parseFloat(item._id.marks.toFixed(2)), // Format to 2 decimal places
            count: item.count
        }));

        return NextResponse.json(
            {
                averageMarksByTA: formattedAveragesByTA,
                marksDistribution: formattedDistribution,
                branchAverages: branchAverages
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error fetching analysis data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analysis data' },
            { status: 500 }
        );
    }
}