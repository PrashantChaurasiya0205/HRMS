'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useSidebar } from '@/context/SidebarContext';
import { 
  Menu, 
  X, 
  Clock, 
  BarChart3, 
  User, 
  FileText, 
  Calendar, 
  LogOut, 
  Settings, 
  Shield, 
  Users,
  Home
} from 'lucide-react';

export default function Sidebar() {
  const { isOpen, isCollapsed, setIsOpen, setIsCollapsed } = useSidebar();
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => pathname === path;
  const userRole = (session?.user?.role || '').toLowerCase();
  const isManager = ['manager', 'ceo', 'co-founder'].includes(userRole);
  const isCEO = userRole === 'ceo';

  const handleLogout = () => {
    localStorage.removeItem('welcomeShown');
    signOut({ callbackUrl: '/login' });
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const mobileMenuButton = document.getElementById('mobile-menu-button');
      const desktopToggleButton = document.getElementById('desktop-toggle-button');
      const target = event.target as Node;
      
      // Check if click is outside sidebar and all buttons
      const isOutsideSidebar = sidebar && !sidebar.contains(target);
      const isOutsideMobileButton = mobileMenuButton && !mobileMenuButton.contains(target);
      const isOutsideDesktopButton = desktopToggleButton && !desktopToggleButton.contains(target);
      
      if (isOutsideSidebar && isOutsideMobileButton && isOutsideDesktopButton) {
        // Close on mobile when clicking outside
        if (window.innerWidth < 1024 && isOpen) {
          setIsOpen(false);
        }
        // Close on desktop when clicking outside (if sidebar is open)
        if (window.innerWidth >= 1024 && isOpen) {
          setIsOpen(false);
        }
      }
    };

    // Only add listener when sidebar is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      show: true
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
      show: true
    },
    {
      name: 'Leave',
      href: '/leave',
      icon: FileText,
      show: true
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      show: true
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: Calendar,
      show: true
    },
    {
      name: 'Manager',
      href: '/manager',
      icon: Users,
      show: isManager
    },
    {
      name: 'Settings',
      href: '/manager/settings',
      icon: Settings,
      show: isManager
    },
    {
      name: 'Status',
      href: '/manager/status',
      icon: Clock,
      show: isManager
    },
    {
      name: 'CEO',
      href: '/ceo',
      icon: Shield,
      show: isCEO
    }
  ];

  const filteredItems = navigationItems.filter(item => item.show);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/10 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`fixed top-0 left-0 h-full bg-white/20 backdrop-blur-lg border-r border-white/40 shadow-xl z-50 transition-all duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${
          isCollapsed ? 'w-16' : 'w-56 sm:w-64'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/40">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-3">
              <img 
                src="/Gemini_Generated_Image_6dg6126dg6126dg6.png" 
                alt="Workshant Logo" 
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-xl font-bold text-gray-800">Workshant</span>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/dashboard" className="flex items-center justify-center">
              <img 
                src="/Gemini_Generated_Image_6dg6126dg6126dg6.png" 
                alt="Workshant Logo" 
                className="w-8 h-8 rounded-lg"
              />
            </Link>
          )}
          
          {/* Toggle buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive(item.href)
                    ? 'bg-blue-500/20 text-blue-700 border border-blue-200/50'
                    : 'text-gray-600 hover:bg-blue-500/20 hover:text-blue-700'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${
                  isActive(item.href) ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'
                }`} />
                {!isCollapsed && (
                  <span className="text-sm font-medium truncate">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 sm:p-4 border-t border-white/40">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.role || 'Employee'}
                </p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        id="mobile-menu-button"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-30 lg:hidden p-2 bg-white/80 backdrop-blur-lg rounded-lg shadow-lg hover:bg-white/90 transition-colors"
      >
        <Menu className="w-6 h-6 text-gray-600" />
      </button>

      {/* Desktop toggle button */}
      <button
        id="desktop-toggle-button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-30 hidden lg:block p-2 bg-white/80 backdrop-blur-lg rounded-lg shadow-lg hover:bg-white/90 transition-colors"
      >
        <Menu className="w-6 h-6 text-gray-600" />
      </button>
    </>
  );
}
