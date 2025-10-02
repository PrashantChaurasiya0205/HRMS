import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import UserProfile from '@/models/UserProfile';
import dbConnect from '@/lib/dbConnect';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const profile = await UserProfile.findOne({ userId: session.user.email });

    return NextResponse.json(profile);

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, phone, department, position, employeeId, hireDate, address, emergencyContact } = body;

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 });
    }

    await dbConnect();
    
    const profile = await UserProfile.findOneAndUpdate(
      { userId: session.user.email },
      {
        userId: session.user.email,
        email: session.user.email,
        firstName,
        lastName,
        phone,
        department,
        position,
        employeeId,
        hireDate,
        address,
        emergencyContact
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
