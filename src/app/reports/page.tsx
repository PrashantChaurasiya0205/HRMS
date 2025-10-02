'use client';

import AppLayout from '@/components/AppLayout';
import AttendanceLog from '@/components/AttendanceLog';
import Statistics from '@/components/Statistics';

export default function ReportsPage() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8" id="reports">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Reports & Analytics</h1>
          <p className="text-gray-600 text-lg">View your attendance history and statistics</p>
        </div>

        {/* Main Content */}
        <div className="space-y-8 mb-8">
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
