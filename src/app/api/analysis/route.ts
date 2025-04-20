import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Marks from '@/models/Marks';

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
                marksDistribution: formattedDistribution
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