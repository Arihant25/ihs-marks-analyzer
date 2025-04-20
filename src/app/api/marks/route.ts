import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Marks from '@/models/Marks';

export async function POST(request: NextRequest) {
    try {
        // Connect to the database
        await connectToDatabase();

        // Parse the request body
        const body = await request.json();
        const { rollNumber, subject, taName, marks } = body;

        // Validate the input
        if (!rollNumber || !subject || !taName || marks === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if marks are within the valid range
        if (isNaN(marks) || marks < 0 || marks > 30) {
            return NextResponse.json(
                { error: 'Marks must be a valid number between 0 and 30' },
                { status: 400 }
            );
        }

        // Round to 2 decimal places for consistency
        const roundedMarks = parseFloat(marks.toFixed(2));

        // Create or update the marks entry
        const result = await Marks.findOneAndUpdate(
            { rollNumber, subject },
            { rollNumber, subject, taName, marks: roundedMarks },
            { upsert: true, new: true }
        );

        return NextResponse.json(
            { success: true, data: result },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error saving marks:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return NextResponse.json(
                { error: `You have already submitted marks for this subject. Please refresh to update.` },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to save marks' },
            { status: 500 }
        );
    }
}