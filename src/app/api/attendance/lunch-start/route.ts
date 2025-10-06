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

    // Get current date in local timezone
    const now = new Date();
    const today = now.toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
    
    await dbConnect();
    
    // Find today's attendance record
    const record = await Attendance.findOne({
      userId: user.email,
      date: today
    });

    if (!record || !record.clockIn) {
      return NextResponse.json({ error: 'Must clock in first' }, { status: 400 });
    }

    if (record.lunchStart) {
      return NextResponse.json({ error: 'Lunch break already started' }, { status: 400 });
    }

    // Update the record
    await Attendance.findOneAndUpdate(
      { userId: user.email, date: today },
      {
        lunchStart: now,
        status: 'LUNCH_BREAK'
      }
    );

    return NextResponse.json({ 
      message: 'Lunch break started',
      lunchStart: now,
      status: 'LUNCH_BREAK'
    });
  } catch (error) {
    console.error('Failed to start lunch:', error);
    return NextResponse.json({ error: 'Failed to start lunch' }, { status: 500 });
  }
}