'use client';

import AppLayout from '@/components/AppLayout';
import Calendar from '@/components/Calendar';

export default function CalendarPage() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Company Calendar</h1>
          <p className="text-gray-600 text-lg">Manage holidays and company events</p>
        </div>

        {/* Calendar Component */}
        <Calendar />
      </div>
    </AppLayout>
  );
}
