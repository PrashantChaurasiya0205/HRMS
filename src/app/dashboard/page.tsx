'use client';

import { AttendanceProvider } from '@/context/AttendanceContext';
import SessionProvider from '@/components/SessionProvider';
import WithAuth from '@/auth/WithAuth';
import Navigation from '@/components/Navigation';
import ClockDisplay from '@/components/ClockDisplay';
import ActionButtons from '@/components/ActionButtons';
import Footer from '@/components/Footer';

export default function DashboardPage() {
  return (
    <SessionProvider>
      <WithAuth>
        <AttendanceProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Navigation />
            
            <div className="container mx-auto px-4 py-8">
              {/* Header */}
              <div className="text-center mb-8" id="dashboard">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
                <p className="text-gray-600 text-lg">Track your daily attendance and working hours</p>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Clock Display */}
                <div className="lg:col-span-1" id="clock">
                  <ClockDisplay />
                </div>

                {/* Action Buttons */}
                <div className="lg:col-span-1" id="actions">
                  <ActionButtons />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick Stats</h3>
                  <p className="text-gray-600">View your attendance summary and working hours</p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Lunch Break Info</h3>
                  <p className="text-gray-600">Track your lunch break duration and timing</p>
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
