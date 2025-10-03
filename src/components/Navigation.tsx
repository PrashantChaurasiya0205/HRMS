'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Menu, X, Clock, BarChart3, User, FileText, Calendar, LogOut } from 'lucide-react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => pathname === path;
  const isManager = session?.user?.role === 'manager';

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4 md:py-5 lg:py-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3">
            <img 
              src="/Gemini_Generated_Image_6dg6126dg6126dg6.png" 
              alt="Workshant Logo" 
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9" 
            />
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800">Workshant</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 2xl:gap-4">
            <Link
              href="/dashboard"
              className={`flex items-center transition-colors duration-200 px-2 py-1.5 rounded-md ${
                isActive('/dashboard') ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <Clock className="w-4 h-4 xl:w-5 xl:h-5 mr-1.5 xl:mr-2" />
              <span className="hidden xl:inline text-sm xl:text-base">Dashboard</span>
            </Link>
            <Link
              href="/reports"
              className={`flex items-center transition-colors duration-200 px-2 py-1.5 rounded-md ${
                isActive('/reports') ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 xl:w-5 xl:h-5 mr-1.5 xl:mr-2" />
              <span className="hidden xl:inline text-sm xl:text-base">Reports</span>
            </Link>
            <Link
              href="/leave"
              className={`flex items-center transition-colors duration-200 px-2 py-1.5 rounded-md ${
                isActive('/leave') ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4 xl:w-5 xl:h-5 mr-1.5 xl:mr-2" />
              <span className="hidden xl:inline text-sm xl:text-base">Leave</span>
            </Link>
            <Link
              href="/profile"
              className={`flex items-center transition-colors duration-200 px-2 py-1.5 rounded-md ${
                isActive('/profile') ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <User className="w-4 h-4 xl:w-5 xl:h-5 mr-1.5 xl:mr-2" />
              <span className="hidden xl:inline text-sm xl:text-base">Profile</span>
            </Link>
            {isManager && (
              <>
                <Link
                  href="/manager"
                  className={`flex items-center transition-colors duration-200 px-2 py-1.5 rounded-md ${
                    isActive('/manager') ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-4 h-4 xl:w-5 xl:h-5 mr-1.5 xl:mr-2" />
                  <span className="hidden xl:inline text-sm xl:text-base">Manager</span>
                </Link>
                <Link
                  href="/calendar"
                  className={`flex items-center transition-colors duration-200 px-2 py-1.5 rounded-md ${
                    isActive('/calendar') ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="w-4 h-4 xl:w-5 xl:h-5 mr-1.5 xl:mr-2" />
                  <span className="hidden xl:inline text-sm xl:text-base">Calendar</span>
                </Link>
              </>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center px-2 py-1.5 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4 xl:w-5 xl:h-5 mr-1.5 xl:mr-2" />
              <span className="hidden xl:inline text-sm xl:text-base">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 sm:p-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          >
            {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 sm:py-6 md:py-8 border-t border-gray-200">
            <div className="flex flex-col space-y-2 sm:space-y-3 md:space-y-4">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 sm:px-6 py-3 sm:py-4 rounded-lg transition-colors duration-200 ${
                  isActive('/dashboard') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mr-3 sm:mr-4" />
                <span className="text-sm sm:text-base md:text-lg">Dashboard</span>
              </Link>
              <Link
                href="/reports"
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 sm:px-6 py-3 sm:py-4 rounded-lg transition-colors duration-200 ${
                  isActive('/reports') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mr-3 sm:mr-4" />
                <span className="text-sm sm:text-base md:text-lg">Reports</span>
              </Link>
              <Link
                href="/leave"
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 sm:px-6 py-3 sm:py-4 rounded-lg transition-colors duration-200 ${
                  isActive('/leave') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mr-3 sm:mr-4" />
                <span className="text-sm sm:text-base md:text-lg">Leave</span>
              </Link>
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 sm:px-6 py-3 sm:py-4 rounded-lg transition-colors duration-200 ${
                  isActive('/profile') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mr-3 sm:mr-4" />
                <span className="text-sm sm:text-base md:text-lg">Profile</span>
              </Link>
              {isManager && (
                <>
                  <Link
                    href="/manager"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-4 sm:px-6 py-3 sm:py-4 rounded-lg transition-colors duration-200 ${
                      isActive('/manager') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <User className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mr-3 sm:mr-4" />
                    <span className="text-sm sm:text-base md:text-lg">Manager</span>
                  </Link>
                  <Link
                    href="/calendar"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-4 sm:px-6 py-3 sm:py-4 rounded-lg transition-colors duration-200 ${
                      isActive('/calendar') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mr-3 sm:mr-4" />
                    <span className="text-sm sm:text-base md:text-lg">Calendar</span>
                  </Link>
                </>
              )}
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex items-center px-4 sm:px-6 py-3 sm:py-4 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
              >
                <LogOut className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mr-3 sm:mr-4" />
                <span className="text-sm sm:text-base md:text-lg">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
