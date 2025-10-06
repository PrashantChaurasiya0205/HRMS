import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LeaveRequest from '@/models/LeaveRequest';
import dbConnect from '@/lib/dbConnect';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !session?.user?.name) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { leaveType, startDate, endDate, reason } = body;

    // Validate required fields
    if (!leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Validate date range
    if (new Date(startDate) > new Date(endDate)) {
      return NextResponse.json({ error: 'Start date cannot be after end date' }, { status: 400 });
    }

    // Check if start date is not in the past
    const today = new Date().toLocaleDateString('en-CA');
    if (startDate < today) {
      return NextResponse.json({ error: 'Cannot request leave for past dates' }, { status: 400 });
    }

    await dbConnect();

    const leaveRequest = new LeaveRequest({
      userId: session.user.email,
      employeeName: session.user.name,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'pending'
    });

    await leaveRequest.save();

    return NextResponse.json({ 
      message: 'Leave request submitted successfully',
      requestId: leaveRequest._id
    });

  } catch (error) {
    console.error('Error submitting leave request:', error);
    return NextResponse.json({ error: 'Failed to submit leave request' }, { status: 500 });
  }
}
