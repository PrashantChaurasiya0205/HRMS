import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SystemConfig from '@/models/SystemConfig';
import dbConnect from '@/lib/dbConnect';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

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

    return NextResponse.json({ workingHours });

  } catch (error) {
    console.error('Error fetching working hours:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
