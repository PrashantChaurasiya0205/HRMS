import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Holiday from '@/models/Holiday';
import dbConnect from '@/lib/dbConnect';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
