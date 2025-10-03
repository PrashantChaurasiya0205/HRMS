import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LeaveRequest from '@/models/LeaveRequest';
import dbConnect from '@/lib/dbConnect';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !session?.user?.name) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is manager
    if (session.user.role !== 'manager') {
      return NextResponse.json({ error: 'Access denied. Manager role required.' }, { status: 403 });
    }

    const body = await request.json();
    const { requestId, status, managerComments } = body;

    if (!requestId || !status) {
      return NextResponse.json({ error: 'Request ID and status are required' }, { status: 400 });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Status must be approved or rejected' }, { status: 400 });
    }

    await dbConnect();

    const leaveRequest = await LeaveRequest.findById(requestId);
    
    if (!leaveRequest) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    if (leaveRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Leave request has already been reviewed' }, { status: 400 });
    }

    // Update the leave request
    leaveRequest.status = status;
    leaveRequest.reviewedAt = new Date();
    leaveRequest.reviewedBy = session.user.email;
    if (managerComments) {
      leaveRequest.managerComments = managerComments;
    }

    await leaveRequest.save();

    return NextResponse.json({ 
      message: `Leave request ${status} successfully`,
      request: leaveRequest
    });

  } catch (error) {
    console.error('Error updating leave request:', error);
    return NextResponse.json({ error: 'Failed to update leave request' }, { status: 500 });
  }
}
