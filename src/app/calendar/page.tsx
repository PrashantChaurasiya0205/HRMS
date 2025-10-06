'use client';

import AppLayout from '@/components/AppLayout';
import Calendar from '@/components/Calendar';
import { useState, useEffect } from 'react';

export default function CalendarPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    setLoading(false);
  }, []);

  const isManager = user?.role === 'manager';

  return (
    <AppLayout>
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Company Calendar</h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">
            {isManager ? 'Manage holidays and company events' : 'View company holidays and events'}
          </p>
        </div>

        {/* Calendar Component */}
        <Calendar isManager={isManager} />
      </div>
    </AppLayout>
  );
}
