'use client';

import AppLayout from '@/components/AppLayout';
import Calendar from '@/components/Calendar';
import { useSession } from 'next-auth/react';

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const userRole = (session?.user?.role || '').toLowerCase();
  const isManager = userRole === 'manager';
  const canManageCalendar = ['manager', 'ceo', 'co-founder', 'cfo'].includes(userRole);

  return (
    <AppLayout>
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Company Calendar</h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">
            {canManageCalendar ? 'Manage holidays and company events' : 'View company holidays and events'}
          </p>
        </div>

        {/* Calendar Component */}
        <Calendar isManager={isManager} canManageCalendar={canManageCalendar} />
      </div>
    </AppLayout>
  );
}
