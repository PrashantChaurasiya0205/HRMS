'use client';

import { AttendanceProvider } from '@/context/AttendanceContext';
import SessionProvider from '@/components/SessionProvider';
import WithAuth from '@/auth/WithAuth';
import Navigation from '@/components/Navigation';
import ClockDisplay from '@/components/ClockDisplay';
import ActionButtons from '@/components/ActionButtons';
import AttendanceLog from '@/components/AttendanceLog';
import Statistics from '@/components/Statistics';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <SessionProvider>
      <WithAuth>
        <AttendanceProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Navigation />
            
            <div className="container mx-auto px-4 py-8">
              {/* Header */}
              <div className="text-center mb-8" id="dashboard">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Attendance Monitor</h1>
                <p className="text-gray-600 text-lg">Track your work hours with ease</p>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
                {/* Left Column - Clock and Actions */}
                <div className="space-y-6">
                  <ClockDisplay />
                  <ActionButtons />
                </div>

                {/* Middle Column - Statistics */}
                <div className="xl:col-span-1" id="statistics">
                  <Statistics />
                </div>

                {/* Right Column - Attendance Log */}
                <div className="xl:col-span-1" id="history">
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
