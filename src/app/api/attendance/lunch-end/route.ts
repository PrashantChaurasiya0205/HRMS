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

    if (!record.lunchStart) {
      return NextResponse.json({ error: 'Must start lunch break first' }, { status: 400 });
    }

    if (record.lunchEnd) {
      return NextResponse.json({ error: 'Lunch break already ended' }, { status: 400 });
    }

    // Calculate lunch duration
    const lunchDuration = (now.getTime() - record.lunchStart.getTime()) / (1000 * 60 * 60);

    // Update the record
    await Attendance.findOneAndUpdate(
      { userId: session.user.email, date: today },
      {
        lunchEnd: now,
        lunchDuration,
        status: 'WORKING'
      }
    );

    return NextResponse.json({ 
      message: 'Lunch break ended',
      lunchEnd: now,
      lunchDuration,
      status: 'WORKING'
    });
  } catch (error) {
    console.error('Failed to end lunch:', error);
    return NextResponse.json({ error: 'Failed to end lunch' }, { status: 500 });
  }
}