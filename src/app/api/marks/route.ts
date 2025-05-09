import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Marks from "@/models/Marks";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.rollNumber) {
      return NextResponse.json(
        {
          error: "Unauthorized: User not authenticated or roll number missing in token",
        },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const rollNumberFromQuery = searchParams.get("rollNumber");
    const subject = searchParams.get("subject");

    // Security Check: Ensure the roll number in the query matches the token roll number
    if (token.rollNumber !== rollNumberFromQuery) {
      return NextResponse.json(
        {
          error: "Forbidden: You can only fetch marks for your own roll number",
        },
        { status: 403 }
      );
    }

    if (!rollNumberFromQuery || !subject) {
      return NextResponse.json(
        { error: "Missing rollNumber or subject query parameter" },
        { status: 400 }
      );
    }

    const marksEntry = await Marks.findOne({
      rollNumber: rollNumberFromQuery,
      subject,
    });

    if (!marksEntry) {
      return NextResponse.json({ marks: 0 }, { status: 200 }); // Return 0 if no entry found
    }

    return NextResponse.json({ marks: marksEntry.marks }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching marks:", error);
    return NextResponse.json(
      { error: "Failed to fetch marks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.rollNumber) {
      return NextResponse.json(
        {
          error:
            "Unauthorized: User not authenticated or roll number missing in token",
        },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Parse the request body
    const body = await request.json();
    const { rollNumber, subject, taName, marks } = body;

    // Security Check: Ensure the roll number in the body matches the session roll number
    if (token.rollNumber !== rollNumber) {
      return NextResponse.json(
        {
          error:
            "Forbidden: You can only submit marks for your own roll number",
        },
        { status: 403 }
      );
    }

    // Validate the input
    if (!rollNumber || !subject || !taName || marks === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if marks are within the valid range
    if (isNaN(marks) || marks < 0 || marks > 30) {
      return NextResponse.json(
        { error: "Marks must be a valid number between 0 and 30" },
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

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: any) {
    console.error("Error saving marks:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        {
          error: `You have already submitted marks for this subject. Please refresh to update.`,
        },
        { status: 409 } // Conflict
      );
    }

    return NextResponse.json(
      { error: "Failed to save marks" },
      { status: 500 }
    );
  }
}
