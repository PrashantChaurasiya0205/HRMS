import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import UserProfile from '@/models/UserProfile';
import SystemConfig from '@/models/SystemConfig';
import dbConnect from '@/lib/dbConnect';

// GET - Fetch all employees and working hours
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user.role || '').toLowerCase();
    const allowedRoles = ['manager', 'ceo', 'co-founder'];
    // heck if user has one of the allowed roles
    if (!userRole || !allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Access denied. Manager/CEO/Co-founder role required.' }, { status: 403 });
    }

    await dbConnect();

    // Get all employees
    const employees = await UserProfile.find({}, 'email role firstName lastName leaveBalance').sort({ role: 1, email: 1 });

    // Get working hours from system configuration
    let systemConfig = await SystemConfig.findOne().sort({ updatedAt: -1 });
    if (!systemConfig) {
      // Create default system config if none exists
      systemConfig = await SystemConfig.create({
        workingHours: {
          dailyHours: 8,
          weeklyHours: 40,
          monthlyHours: 160
        },
        updatedBy: session.user.email
      });
    }
    
    const workingHours = systemConfig.workingHours;

    return NextResponse.json({ 
      employees,
      workingHours 
    });

  } catch (error) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Handle various admin operations
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user.role || '').toLowerCase();
    const allowedRoles = ['manager', 'ceo', 'co-founder'];
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Access denied. Manager/CEO/Co-founder role required.' }, { status: 403 });
    }

    const { action, ...data } = await request.json();

    await dbConnect();

    switch (action) {
      case 'updateWorkingHours': {
        const { dailyHours, weeklyHours, monthlyHours } = data;
        
        if (!dailyHours || !weeklyHours || !monthlyHours) {
          return NextResponse.json({ error: 'All working hours fields are required' }, { status: 400 });
        }

        if (dailyHours < 1 || dailyHours > 24) {
          return NextResponse.json({ error: 'Daily hours must be between 1 and 24' }, { status: 400 });
        }

        if (weeklyHours < 1 || weeklyHours > 168) {
          return NextResponse.json({ error: 'Weekly hours must be between 1 and 168' }, { status: 400 });
        }

        if (monthlyHours < 1 || monthlyHours > 720) {
          return NextResponse.json({ error: 'Monthly hours must be between 1 and 720' }, { status: 400 });
        }

        // Save working hours to system configuration
        await SystemConfig.create({
          workingHours: {
            dailyHours,
            weeklyHours,
            monthlyHours
          },
          updatedBy: session.user.email
        });

        return NextResponse.json({ 
          message: 'Working hours updated successfully',
          workingHours: { dailyHours, weeklyHours, monthlyHours }
        });
      }

      case 'updateLeaveBalance': {
        const { employeeId, leaveType, balance } = data;

        if (!employeeId || !leaveType || balance === undefined) {
          return NextResponse.json({ error: 'Employee ID, leave type, and balance are required' }, { status: 400 });
        }

        if (!['sick', 'vacation', 'personal', 'workFromHome', 'emergency'].includes(leaveType)) {
          return NextResponse.json({ error: 'Invalid leave type' }, { status: 400 });
        }

        if (balance < 0) {
          return NextResponse.json({ error: 'Balance cannot be negative' }, { status: 400 });
        }

        const user = await UserProfile.findById(employeeId);
        if (!user) {
          return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        // Update the specific leave balance
        user.leaveBalance[leaveType as keyof typeof user.leaveBalance] = balance;
        await user.save();

        return NextResponse.json({ 
          message: 'Leave balance updated successfully',
          employee: {
            id: user._id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            leaveBalance: user.leaveBalance
          }
        });
      }

      case 'bulkUpdateLeaveBalances': {
        const { employees, leaveBalances } = data;

        if (!employees || !Array.isArray(employees) || !leaveBalances) {
          return NextResponse.json({ error: 'Employees array and leave balances are required' }, { status: 400 });
        }

        const updatePromises = employees.map((employeeId: string) => {
          return Promise.all([
            UserProfile.findByIdAndUpdate(employeeId, { 'leaveBalance.sick': leaveBalances.sick }),
            UserProfile.findByIdAndUpdate(employeeId, { 'leaveBalance.vacation': leaveBalances.vacation }),
            UserProfile.findByIdAndUpdate(employeeId, { 'leaveBalance.personal': leaveBalances.personal }),
            UserProfile.findByIdAndUpdate(employeeId, { 'leaveBalance.workFromHome': leaveBalances.workFromHome }),
            UserProfile.findByIdAndUpdate(employeeId, { 'leaveBalance.emergency': leaveBalances.emergency })
          ]);
        });

        await Promise.all(updatePromises);

        return NextResponse.json({ 
          message: 'Leave balances updated for all employees successfully',
          updatedCount: employees.length
        });
      }

      case 'fixLeaveBalances': {
        // Find all users without proper leave balance structure
        const users = await UserProfile.find({});
        let updatedCount = 0;

        for (const user of users) {
          let needsUpdate = false;
          
          // Check if leaveBalance exists and has all required fields
          if (!user.leaveBalance || 
              typeof user.leaveBalance.sick !== 'number' ||
              typeof user.leaveBalance.vacation !== 'number' ||
              typeof user.leaveBalance.personal !== 'number' ||
              typeof user.leaveBalance.workFromHome !== 'number' ||
              typeof user.leaveBalance.emergency !== 'number') {
            
            needsUpdate = true;
          }

          if (needsUpdate) {
            // Set default leave balances
            user.leaveBalance = {
              sick: 10,
              vacation: 20,
              personal: 5,
              workFromHome: 12,
              emergency: 3
            };
            
            await user.save();
            updatedCount++;
          }
        }

        return NextResponse.json({ 
          message: 'Leave balances fixed successfully',
          updatedCount 
        });
      }

      case 'updateUserRole': {
        const { employeeId, role } = data;

        if (!employeeId || !role) {
          return NextResponse.json({ error: 'Employee ID and role are required' }, { status: 400 });
        }

        const validRoles = ['employee', 'intern', 'hr', 'manager', 'co-founder', 'ceo'];
        if (!validRoles.includes(role)) {
          return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        const user = await UserProfile.findById(employeeId);
        if (!user) {
          return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        user.role = role;
        await user.save();

        return NextResponse.json({ 
          message: 'User role updated successfully',
          user: {
            id: user._id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role
          }
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error processing admin request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
