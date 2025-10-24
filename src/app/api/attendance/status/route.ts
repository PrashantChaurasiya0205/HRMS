import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Attendance from '@/models/Attendance';
import UserProfile from '@/models/UserProfile';
import dbConnect from '@/lib/dbConnect';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is manager, CEO, or Co-founder (case-insensitive)
    const userRole = (session.user?.role || '').toLowerCase();
    const allowedRoles = ['manager', 'ceo', 'co-founder', 'cfo'];
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Access denied. Manager/CEO/Co-founder role required.' }, { status: 403 });
    }

    await dbConnect();

    // Get today's date in YYYY-MM-DD format (local timezone)
    const now = new Date();
    const today = now.toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone

    // Get all employees
    const employees = await UserProfile.find({ 
      email: { $ne: 'system@company.com' } 
    }, 'email firstName lastName role').sort({ role: 1, email: 1 });

    // Get all today's attendance records (handle potential newline characters and timezone issues)
    const attendanceRecords = await Attendance.find({
      $or: [
        { date: today },
        { date: today + '\n' },
        { date: today.trim() },
        // Also check for records created today (in case of timezone issues)
        {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          }
        }
      ]
    });

    // Create a map of attendance records by userId
    const attendanceMap = new Map();
    attendanceRecords.forEach(record => {
      attendanceMap.set(record.userId, record);
    });

    // Combine employee data with attendance status
    const employeesWithStatus = employees.map(employee => {
      const attendance = attendanceMap.get(employee.email);
      
      let status = 'offline';
      let isCheckedIn = false;
      let isOnLunch = false;
      
      if (attendance) {
        isCheckedIn = !!attendance.clockIn;
        isOnLunch = !!attendance.lunchStart && !attendance.lunchEnd;
        
        if (attendance.status === 'CLOCKED_OUT' || attendance.clockOut) {
          status = 'completed';
        } else if (attendance.status === 'LUNCH_BREAK' || (attendance.lunchStart && !attendance.lunchEnd)) {
          status = 'lunch';
        } else if (attendance.status === 'WORKING' || (attendance.clockIn && !attendance.clockOut)) {
          status = 'working';
        }
      }

      return {
        _id: employee._id,
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        role: employee.role,
        status,
        clockInTime: attendance?.clockIn,
        clockOutTime: attendance?.clockOut,
        lunchStartTime: attendance?.lunchStart,
        lunchEndTime: attendance?.lunchEnd,
        totalWorkingHours: attendance?.totalWorkingHours || 0,
        isCheckedIn,
        isOnLunch
      };
    });

    return NextResponse.json({
      employees: employeesWithStatus
    });

  } catch (error) {
    console.error('Error fetching employee status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
