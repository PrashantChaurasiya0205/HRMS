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

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    await dbConnect();
    
    // Find today's attendance record
    const record = await Attendance.findOne({
      userId: session.user.email,
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
      { userId: session.user.email, date: today },
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