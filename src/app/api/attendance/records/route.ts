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

    await dbConnect();
    const records = await Attendance.find({
      userId: user.email
    }).sort({ date: -1 });

    return NextResponse.json(records);

  } catch (error) {
    console.error('Error fetching records:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
