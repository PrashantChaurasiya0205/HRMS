import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/authMiddleware';
import SystemConfig from '@/models/SystemConfig';
import dbConnect from '@/lib/dbConnect';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
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
        updatedBy: user.email
      });
    }
    
    const workingHours = systemConfig.workingHours;

    return NextResponse.json({ workingHours });

  } catch (error) {
    console.error('Error fetching working hours:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
