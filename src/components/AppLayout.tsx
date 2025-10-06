'use client';

import { AttendanceProvider } from '@/context/AttendanceContext';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';
import WithAuth from '@/auth/WithAuth';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

interface AppLayoutProps {
  children: React.ReactNode;
}

function AppLayoutContent({ children }: AppLayoutProps) {
  const { isOpen, isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Sidebar />
      <div 
        className={`transition-all duration-300 ${
          isOpen || (isCollapsed && window.innerWidth >= 1024) 
            ? (isCollapsed ? 'lg:ml-16' : 'lg:ml-56 sm:ml-64') 
            : 'lg:ml-0'
        }`}
        style={{ paddingTop: '80px' }}
      >
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <WithAuth>
      <AttendanceProvider>
        <SidebarProvider>
          <AppLayoutContent>{children}</AppLayoutContent>
        </SidebarProvider>
      </AttendanceProvider>
    </WithAuth>
  );
}
