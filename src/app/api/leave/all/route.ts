import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LeaveRequest from '@/models/LeaveRequest';
import dbConnect from '@/lib/dbConnect';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is manager, CEO, or Co-founder (case-insensitive)
    const userRole = (session.user.role || '').toLowerCase();
    const allowedRoles = ['manager', 'ceo', 'co-founder', 'cfo'];
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Access denied. Manager/CEO/Co-founder role required.' }, { status: 403 });
    }

    await dbConnect();
    
    // Get all leave requests for manager view
    const requests = await LeaveRequest.find({}).sort({ submittedAt: -1 });

    return NextResponse.json(requests);

  } catch (error) {
    console.error('Error fetching all leave requests:', error);
    return NextResponse.json({ error: 'Failed to fetch leave requests' }, { status: 500 });
  }
}
