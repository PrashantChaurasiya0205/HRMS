import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/authMiddleware';
import dbConnect from '@/lib/dbConnect';
import Attendance from '@/models/Attendance';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recordId, extraTimeReason, isContinuing, isExtraTimeEnabled, regularHours, extraHours, totalWorkingHours } = await request.json();

    if (!recordId || !extraTimeReason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // Find the attendance record
    const attendance = await Attendance.findById(recordId);
    
    if (!attendance) {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 });
    }

    // Verify the record belongs to the current user
    if (attendance.userId !== user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Save reason and calculated hours
    attendance.extraTimeReason = extraTimeReason;
    attendance.isExtraTimeEnabled = isExtraTimeEnabled || false;
    
    // Update hours if provided
    if (regularHours !== undefined) {
      attendance.regularHours = regularHours;
    }
    if (extraHours !== undefined) {
      attendance.extraHours = extraHours;
    }
    if (totalWorkingHours !== undefined) {
      attendance.totalWorkingHours = totalWorkingHours;
    }

    // If not continuing, update status to CLOCKED_OUT
    if (!isContinuing) {
      attendance.status = 'CLOCKED_OUT';
    }

    await attendance.save();

    return NextResponse.json({ 
      success: true, 
      message: isContinuing ? 'Extra time reason and hours saved. Continue working.' : 'Extra time reason saved. Clocked out.',
      data: {
        extraTimeReason,
        isExtraTimeEnabled: isExtraTimeEnabled || false,
        regularHours,
        extraHours,
        totalWorkingHours
      }
    });

  } catch (error) {
    console.error('Error updating extra time:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
