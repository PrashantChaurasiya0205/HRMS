'use client';

import AppLayout from '@/components/AppLayout';
import ClockDisplay from '@/components/ClockDisplay';
import ActionButtons from '@/components/ActionButtons';
import TodaysProgressOnly from '@/components/TodaysProgressOnly';
import WelcomeMessage from '@/components/WelcomeMessage';

export default function DashboardPage() {
  return (
    <AppLayout>
      <WelcomeMessage />
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8" id="dashboard">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">Track your daily attendance and working hours</p>
        </div>

        {/* Main Content */}
        <div className="space-y-6 sm:space-y-8 mb-6 sm:mb-8">
          {/* Clock Display */}
          <div id="clock">
            <ClockDisplay />
          </div>

          {/* Action Buttons */}
          <div id="actions">
            <ActionButtons />
          </div>

          {/* Today's Progress Only */}
          <div id="progress">
            <TodaysProgressOnly />
          </div>
        </div>


        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Quick Stats</h3>
            <p className="text-sm sm:text-base text-gray-600">View your attendance summary and working hours</p>
          </div>

          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Lunch Break Info</h3>
            <p className="text-sm sm:text-base text-gray-600">Track your lunch break duration and timing</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
