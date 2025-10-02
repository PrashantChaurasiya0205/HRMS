import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Attendance from '@/models/Attendance';
import dbConnect from '@/lib/dbConnect';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current date in local timezone
    const now = new Date();
    const today = now.toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
    await dbConnect();
    
    // Find today's attendance record
    const record = await Attendance.findOne({
      userId: session.user.email,
      date: today
    });

    if (!record || !record.clockIn) {
      return NextResponse.json({ error: 'Must clock in first' }, { status: 400 });
    }

    if (record.clockOut) {
      return NextResponse.json({ error: 'Already checked out today' }, { status: 400 });
    }

    // Calculate total working hours
    const totalWorkingHours = (now.getTime() - record.clockIn.getTime()) / (1000 * 60 * 60);
    const lunchDuration = record.lunchStart && record.lunchEnd 
      ? (record.lunchEnd.getTime() - record.lunchStart.getTime()) / (1000 * 60 * 60)
      : 0;

    // Update the record
    await Attendance.findOneAndUpdate(
      { userId: session.user.email, date: today },
      {
        clockOut: now,
        totalWorkingHours: totalWorkingHours - lunchDuration,
        lunchDuration,
        status: 'CLOCKED_OUT'
      }
    );

    return NextResponse.json({ 
      message: 'Successfully checked out',
      clockOut: now,
      totalWorkingHours: totalWorkingHours - lunchDuration,
      status: 'CLOCKED_OUT'
    });
  } catch (error) {
    console.error('Failed to clock out:', error);
    return NextResponse.json({ error: 'Failed to clock out' }, { status: 500 });
  }
}