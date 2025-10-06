import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/authMiddleware';
import UserProfile from '@/models/UserProfile';
import dbConnect from '@/lib/dbConnect';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    let profile = await UserProfile.findOne({ email: user.email });

    // If profile doesn't exist, create one automatically
    if (!profile) {
      const nameParts = user.email.split('@')[0].split('.');
      // Set admin@company.com as manager
      const userRole = user.email === 'admin@company.com' ? 'manager' : 'employee';
      
      profile = new UserProfile({
        userId: user.email,
        email: user.email,
        firstName: nameParts[0] || 'User',
        lastName: nameParts[1] || 'User',
        role: userRole,
        leaveBalance: {
          sick: 10,
          vacation: 20,
          personal: 5,
          workFromHome: 12,
          emergency: 3
        }
      });
      await profile.save();
    }

    return NextResponse.json(profile);

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, phone, department, position, employeeId, hireDate, address, emergencyContact } = body;

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 });
    }

    await dbConnect();
    
    const profile = await UserProfile.findOneAndUpdate(
      { email: user.email },
      {
        userId: user.email,
        email: user.email,
        firstName,
        lastName,
        phone,
        department,
        position,
        employeeId,
        hireDate,
        address,
        emergencyContact,
        // Ensure leave balance is set with defaults if not exists
        $setOnInsert: {
          leaveBalance: {
            sick: 10,
            vacation: 20,
            personal: 5,
            workFromHome: 12,
            emergency: 3
          }
        }
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      profile 
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
