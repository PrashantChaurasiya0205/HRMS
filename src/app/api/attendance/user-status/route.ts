import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/authMiddleware';
import Attendance from '@/models/Attendance';
import dbConnect from '@/lib/dbConnect';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current date in local timezone
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
    await dbConnect();
    
    const record = await Attendance.findOne({
      userId: user.email,
      date: today
    });

    return NextResponse.json({
      hasCheckedIn: !!record?.clockIn,
      hasCheckedOut: !!record?.clockOut,
      currentStatus: record?.status || 'IDLE'
    });

  } catch (error) {
    console.error('Error checking attendance status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
