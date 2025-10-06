import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/authMiddleware';
import Holiday from '@/models/Holiday';
import dbConnect from '@/lib/dbConnect';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const holidays = await Holiday.find().sort({ date: 1 });

    return NextResponse.json(holidays);

  } catch (error) {
    console.error('Error fetching holidays:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is manager
    if (user.role !== 'manager') {
      return NextResponse.json({ error: 'Access denied. Manager role required.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, date, type, description, isRecurring } = body;

    if (!name || !date || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();
    
    const holiday = new Holiday({
      name,
      date,
      type,
      description,
      isRecurring: isRecurring || false
    });

    await holiday.save();

    return NextResponse.json({ 
      message: 'Holiday added successfully',
      holiday 
    });

  } catch (error) {
    console.error('Error adding holiday:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
