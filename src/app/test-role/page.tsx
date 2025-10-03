'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TestRolePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log('Test Role Page - Status:', status);
    console.log('Test Role Page - Session:', session);
    console.log('Test Role Page - User Role:', session?.user?.role);
  }, [session, status]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>Loading session...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Not Authenticated</h1>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Role Test Page</h1>
        
        <div className="space-y-4">
          <div>
            <strong>Status:</strong> {status}
          </div>
          
          <div>
            <strong>Email:</strong> {session?.user?.email || 'Not set'}
          </div>
          
          <div>
            <strong>Role:</strong> {session?.user?.role || 'Not set'}
          </div>
          
          <div>
            <strong>Is Manager:</strong> {session?.user?.role === 'manager' ? '✅ Yes' : '❌ No'}
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
          
          {session?.user?.role === 'manager' && (
            <>
              <button
                onClick={() => router.push('/manager')}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Go to Manager Page
              </button>
              
              <button
                onClick={() => router.push('/calendar')}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Go to Calendar Page
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
