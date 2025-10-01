'use client';

import { AttendanceProvider } from '@/context/AttendanceContext';
import SessionProvider from '@/components/SessionProvider';
import WithAuth from '@/auth/WithAuth';
import Navigation from '@/components/Navigation';
import AttendanceLog from '@/components/AttendanceLog';
import Statistics from '@/components/Statistics';
import Footer from '@/components/Footer';

export default function ReportsPage() {
  return (
    <SessionProvider>
      <WithAuth>
        <AttendanceProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Navigation />
            
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
            
            <Footer />
          </div>
        </AttendanceProvider>
      </WithAuth>
    </SessionProvider>
  );
}
