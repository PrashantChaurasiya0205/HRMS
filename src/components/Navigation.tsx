'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Clock, BarChart3, History, User, FileText } from 'lucide-react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <img src="/Gemini_Generated_Image_6dg6126dg6126dg6.png" alt="Workshant Logo" className="w-8 h-8 mr-2" />
            <h1 className="text-xl font-bold text-gray-800">Workshant</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            <Link
              href="/dashboard"
              className={`flex items-center transition-colors ${
                isActive('/dashboard') ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Clock className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
            <Link
              href="/reports"
              className={`flex items-center transition-colors ${
                isActive('/reports') ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Reports
            </Link>
            <Link
              href="/leave"
              className={`flex items-center transition-colors ${
                isActive('/leave') ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Leave
            </Link>
                        <Link
                          href="/profile"
                          className={`flex items-center transition-colors ${
                            isActive('/profile') ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
                          }`}
                        >
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </Link>
                        <Link
                          href="/manager"
                          className={`flex items-center transition-colors ${
                            isActive('/manager') ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
                          }`}
                        >
                          <User className="w-4 h-4 mr-2" />
                          Manager
                        </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isActive('/dashboard') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Clock className="w-4 h-4 mr-3" />
                Dashboard
              </Link>
              <Link
                href="/reports"
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isActive('/reports') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-3" />
                Reports
              </Link>
              <Link
                href="/leave"
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isActive('/leave') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-4 h-4 mr-3" />
                Leave
              </Link>
                          <Link
                            href="/profile"
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                              isActive('/profile') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <User className="w-4 h-4 mr-3" />
                            Profile
                          </Link>
                          <Link
                            href="/manager"
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                              isActive('/manager') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <User className="w-4 h-4 mr-3" />
                            Manager
                          </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
