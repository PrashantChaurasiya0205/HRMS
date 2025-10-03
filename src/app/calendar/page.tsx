'use client';

import AppLayout from '@/components/AppLayout';
import Calendar from '@/components/Calendar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Shield } from 'lucide-react';

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Check if user is manager
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (session && session.user?.role !== 'manager') {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <AppLayout>
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
            <span className="text-gray-600">Loading...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show access denied if not authenticated or not manager
  if (status === 'unauthenticated') {
    return (
      <AppLayout>
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h1>
            <p className="text-gray-600 mb-6">Please log in to access this page.</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (session && session.user?.role !== 'manager') {
    return (
      <AppLayout>
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Company Calendar</h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">Manage holidays and company events</p>
        </div>

        {/* Calendar Component */}
        <Calendar />
      </div>
    </AppLayout>
  );
}
