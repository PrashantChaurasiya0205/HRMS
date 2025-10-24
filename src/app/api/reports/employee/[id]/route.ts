import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import UserProfile from '@/models/UserProfile';
import Attendance from '@/models/Attendance';
import LeaveRequest from '@/models/LeaveRequest';
import dbConnect from '@/lib/dbConnect';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const userRole = (session.user.role || '').toLowerCase();
    const allowedRoles = ['manager', 'ceo', 'co-founder', 'cfo'];
    const isManager = allowedRoles.includes(userRole);
    
    // If not a manager, check if they're trying to access their own data
    if (!isManager) {
      // Get employee details to check if it's their own data
      let employee;
      if (resolvedParams.id.includes('@')) {
        employee = await UserProfile.findOne({ email: resolvedParams.id });
      } else {
        employee = await UserProfile.findById(resolvedParams.id);
      }
      
      if (!employee || employee.email !== session.user.email) {
        return NextResponse.json({ error: 'Access denied. You can only view your own reports.' }, { status: 403 });
      }
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
    }

    // Get employee details - handle both MongoDB ID and email
    let employee;
    if (resolvedParams.id.includes('@')) {
      // If it's an email
      employee = await UserProfile.findOne({ email: resolvedParams.id });
    } else {
      // If it's a MongoDB ID
      employee = await UserProfile.findById(resolvedParams.id);
    }
    
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Get attendance records for the date range
    const attendanceRecords = await Attendance.find({
      userId: employee.userId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: 1 });

    // Get leave records
    const leaveRequests = await LeaveRequest.find({
      userId: employee.userId
    }).sort({ appliedDate: -1 });

    // Calculate attendance statistics
    const totalDays = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const presentDays = attendanceRecords.filter(record => record.clockIn && record.clockOut).length;
    const absentDays = totalDays - presentDays;
    const lateDays = attendanceRecords.filter(record => {
      if (!record.clockIn) return false;
      const clockInTime = new Date(`2000-01-01T${record.clockIn}`);
      const expectedTime = new Date('2000-01-01T09:00:00');
      return clockInTime > expectedTime;
    }).length;

    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // Calculate total hours and overtime
    let totalHours = 0;
    let overtimeHours = 0;
    let totalWorkingDays = 0;

    attendanceRecords.forEach(record => {
      if (record.clockIn && record.clockOut) {
        const clockIn = new Date(`2000-01-01T${record.clockIn}`);
        const clockOut = new Date(`2000-01-01T${record.clockOut}`);
        const lunchStart = record.lunchStart ? new Date(`2000-01-01T${record.lunchStart}`) : null;
        const lunchEnd = record.lunchEnd ? new Date(`2000-01-01T${record.lunchEnd}`) : null;
        
        let workingHours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
        
        // Subtract lunch break if taken
        if (lunchStart && lunchEnd) {
          const lunchDuration = (lunchEnd.getTime() - lunchStart.getTime()) / (1000 * 60 * 60);
          workingHours -= lunchDuration;
        }
        
        totalHours += workingHours;
        totalWorkingDays++;
        
        // Calculate overtime (assuming 8 hours is standard)
        if (workingHours > 8) {
          overtimeHours += workingHours - 8;
        }
      }
    });

    const averageDailyHours = totalWorkingDays > 0 ? totalHours / totalWorkingDays : 0;

    // Calculate punctuality score
    const punctualityScore = totalWorkingDays > 0 ? Math.round(((totalWorkingDays - lateDays) / totalWorkingDays) * 100) : 0;

    // Determine attendance trend (simplified logic)
    const firstHalf = attendanceRecords.slice(0, Math.floor(attendanceRecords.length / 2));
    const secondHalf = attendanceRecords.slice(Math.floor(attendanceRecords.length / 2));
    
    const firstHalfAttendance = firstHalf.length > 0 ? 
      firstHalf.filter(record => record.clockIn && record.clockOut).length / firstHalf.length : 0;
    const secondHalfAttendance = secondHalf.length > 0 ? 
      secondHalf.filter(record => record.clockIn && record.clockOut).length / secondHalf.length : 0;

    let attendanceTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (secondHalfAttendance > firstHalfAttendance + 0.1) {
      attendanceTrend = 'improving';
    } else if (secondHalfAttendance < firstHalfAttendance - 0.1) {
      attendanceTrend = 'declining';
    }

    // Calculate last month attendance (simplified)
    const lastMonthAttendance = Math.round(attendancePercentage);

    // Separate leave requests
    const takenLeaves = leaveRequests.filter(leave => leave.status === 'approved');
    const pendingLeaves = leaveRequests.filter(leave => leave.status === 'pending');

    const report = {
      employee: {
        _id: employee._id,
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        role: employee.role,
        department: employee.department,
        position: employee.position,
        hireDate: employee.hireDate
      },
      attendance: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        attendancePercentage,
        totalHours: Math.round(totalHours * 10) / 10,
        overtimeHours: Math.round(overtimeHours * 10) / 10,
        averageDailyHours: Math.round(averageDailyHours * 10) / 10,
        records: attendanceRecords.map(record => ({
          _id: record._id,
          date: record.date,
          clockIn: record.clockIn,
          clockOut: record.clockOut,
          lunchStart: record.lunchStart,
          lunchEnd: record.lunchEnd,
          totalWorkingHours: record.totalWorkingHours,
          status: record.status
        }))
      },
      leave: {
        balance: employee.leaveBalance,
        taken: takenLeaves.map(leave => ({
          _id: leave._id,
          type: leave.type,
          startDate: leave.startDate,
          endDate: leave.endDate,
          days: leave.days,
          reason: leave.reason,
          status: leave.status,
          appliedDate: leave.appliedDate
        })),
        pending: pendingLeaves.map(leave => ({
          _id: leave._id,
          type: leave.type,
          startDate: leave.startDate,
          endDate: leave.endDate,
          days: leave.days,
          reason: leave.reason,
          status: leave.status,
          appliedDate: leave.appliedDate
        }))
      },
      performance: {
        punctualityScore,
        attendanceTrend,
        lastMonthAttendance
      }
    };

    return NextResponse.json(report);

  } catch (error) {
    console.error('Error generating employee report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
