'use client';

import AppLayout from '@/components/AppLayout';
import AttendanceLog from '@/components/AttendanceLog';
import Statistics from '@/components/Statistics';

export default function ReportsPage() {
  return (
    <AppLayout>
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8" id="reports">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Reports & Analytics</h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">View your attendance history and statistics</p>
        </div>

        {/* Main Content */}
        <div className="space-y-6 sm:space-y-8 mb-6 sm:mb-8">
          {/* Statistics */}
          <div id="statistics">
            <Statistics />
          </div>

          {/* Attendance Log */}
          <div id="history">
            <AttendanceLog />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
