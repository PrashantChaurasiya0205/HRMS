import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LeaveRequest from '@/models/LeaveRequest';
import UserProfile from '@/models/UserProfile';
import dbConnect from '@/lib/dbConnect';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !session?.user?.name) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is manager, CEO, or Co-founder (case-insensitive)
    const userRole = (session.user.role || '').toLowerCase();
    const allowedRoles = ['manager', 'ceo', 'co-founder'];
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Access denied. Manager/CEO/Co-founder role required.' }, { status: 403 });
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

    // If approved, deduct from user's leave balance
    if (status === 'approved') {
      const userProfile = await UserProfile.findOne({ email: leaveRequest.userId });
      if (userProfile) {
        // Calculate number of days
        const startDate = new Date(leaveRequest.startDate);
        const endDate = new Date(leaveRequest.endDate);
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        // Deduct from appropriate leave type
        const leaveType = leaveRequest.leaveType;
        if (leaveType === 'work-from-home') {
          userProfile.leaveBalance.workFromHome -= daysDiff;
        } else if (leaveType === 'sick') {
          userProfile.leaveBalance.sick -= daysDiff;
        } else if (leaveType === 'vacation') {
          userProfile.leaveBalance.vacation -= daysDiff;
        } else if (leaveType === 'personal') {
          userProfile.leaveBalance.personal -= daysDiff;
        } else if (leaveType === 'emergency') {
          userProfile.leaveBalance.emergency -= daysDiff;
        }
        
        // Ensure balance doesn't go below 0
        userProfile.leaveBalance.workFromHome = Math.max(0, userProfile.leaveBalance.workFromHome);
        userProfile.leaveBalance.sick = Math.max(0, userProfile.leaveBalance.sick);
        userProfile.leaveBalance.vacation = Math.max(0, userProfile.leaveBalance.vacation);
        userProfile.leaveBalance.personal = Math.max(0, userProfile.leaveBalance.personal);
        userProfile.leaveBalance.emergency = Math.max(0, userProfile.leaveBalance.emergency);
        
        await userProfile.save();
      }
    }

    return NextResponse.json({ 
      message: `Leave request ${status} successfully`,
      request: leaveRequest
    });

  } catch (error) {
    console.error('Error updating leave request:', error);
    return NextResponse.json({ error: 'Failed to update leave request' }, { status: 500 });
  }
}
