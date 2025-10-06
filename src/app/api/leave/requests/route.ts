import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/authMiddleware';
import LeaveRequest from '@/models/LeaveRequest';
import dbConnect from '@/lib/dbConnect';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const requests = await LeaveRequest.find({
      userId: user.email
    }).sort({ submittedAt: -1 });

    return NextResponse.json(requests);

  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return NextResponse.json({ error: 'Failed to fetch leave requests' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is manager, CEO, or Co-founder
    const userRole = (user.role || '').toLowerCase();
    const allowedRoles = ['manager', 'ceo', 'co-founder'];
    
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Access denied. Manager role required.' }, { status: 403 });
    }

    const { requestId } = await request.json();
    
    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    await dbConnect();
    
    const deletedRequest = await LeaveRequest.findByIdAndDelete(requestId);
    
    if (!deletedRequest) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Leave request deleted successfully' });

  } catch (error) {
    console.error('Error deleting leave request:', error);
    return NextResponse.json({ error: 'Failed to delete leave request' }, { status: 500 });
  }
}
