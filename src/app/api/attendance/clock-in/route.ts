import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/authMiddleware';
import Attendance from '@/models/Attendance';
import dbConnect from '@/lib/dbConnect';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current date and time in local timezone
    const now = new Date();
    const today = now.toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
    
    await dbConnect();
    
    // Check if already checked in today
    const existingRecord = await Attendance.findOne({
      userId: user.email,
      date: today
    });

    if (existingRecord?.clockIn) {
      return NextResponse.json({ error: 'Already checked in today' }, { status: 400 });
    }

    // Create or update attendance record
    const attendanceRecord = {
      userId: user.email,
      date: today,
      clockIn: now,
      status: 'WORKING',
      totalWorkingHours: 0,
      lunchDuration: 0
    };

    await Attendance.findOneAndUpdate(
      { userId: user.email, date: today },
      attendanceRecord,
      { upsert: true, new: true }
    );

    return NextResponse.json({ 
      message: 'Successfully checked in',
      clockIn: now,
      status: 'WORKING'
    });

  } catch (error) {
    console.error('Error clocking in:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
