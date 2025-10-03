'use client';

import { AttendanceProvider } from '@/context/AttendanceContext';
import WithAuth from '@/auth/WithAuth';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <WithAuth>
      <AttendanceProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Navigation />
          {children}
          <Footer />
        </div>
      </AttendanceProvider>
    </WithAuth>
  );
}
