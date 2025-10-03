import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Holiday from '@/models/Holiday';
import dbConnect from '@/lib/dbConnect';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is manager
    if (session.user.role !== 'manager') {
      return NextResponse.json({ error: 'Access denied. Manager role required.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, date, type, description, isRecurring } = body;

    if (!name || !date || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();
    
    const { id } = await params;
    const holiday = await Holiday.findByIdAndUpdate(
      id,
      { name, date, type, description, isRecurring },
      { new: true }
    );

    if (!holiday) {
      return NextResponse.json({ error: 'Holiday not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Holiday updated successfully',
      holiday 
    });

  } catch (error) {
    console.error('Error updating holiday:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is manager
    if (session.user.role !== 'manager') {
      return NextResponse.json({ error: 'Access denied. Manager role required.' }, { status: 403 });
    }

    await dbConnect();
    
    const { id } = await params;
    const holiday = await Holiday.findByIdAndDelete(id);

    if (!holiday) {
      return NextResponse.json({ error: 'Holiday not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Holiday deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting holiday:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
