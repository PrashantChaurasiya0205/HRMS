import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Attendance from '@/models/Attendance';
import dbConnect from '@/lib/dbConnect';
import { differenceInDays, differenceInYears } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const attendances = await Attendance.find({
      userId: session.user.email
    });

    // Calculate statistics
    const totalDays = attendances.length;
    const totalHours = attendances.reduce((sum, record) => {
      return sum + (record.totalWorkingHours || 0);
    }, 0);
    
    const avgDailyHours = totalDays > 0 ? totalHours / totalDays : 0;
    
    // Calculate working days (days with clock in/out)
    const workingDays = attendances.filter(record => 
      record.clockIn && record.clockOut
    ).length;
    
    // Calculate attendance rate (working days / total possible days)
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const daysPassed = Math.min(currentDate.getDate(), daysInMonth);
    
    const attendanceRate = daysPassed > 0 ? (workingDays / daysPassed) * 100 : 0;
    
    // Calculate experience (months since first attendance)
    let experience = 0;
    if (attendances.length > 0) {
      const firstAttendance = attendances.reduce((earliest, record) => {
        return new Date(record.date) < new Date(earliest.date) ? record : earliest;
      });
      const monthsDiff = (currentDate.getTime() - new Date(firstAttendance.date).getTime()) / (1000 * 60 * 60 * 24 * 30);
      experience = Math.max(0, monthsDiff / 12);
    }

    return NextResponse.json({
      avgDailyHours,
      workingDays,
      attendanceRate,
      experience
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
