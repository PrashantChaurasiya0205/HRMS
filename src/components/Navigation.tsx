'use client';

import React, { useState } from 'react';
import { Menu, X, Clock, BarChart3, History } from 'lucide-react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-blue-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-800">Attendance Monitor</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            <button
              onClick={() => scrollToSection('dashboard')}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Clock className="w-4 h-4 mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => scrollToSection('statistics')}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Statistics
            </button>
            <button
              onClick={() => scrollToSection('history')}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <History className="w-4 h-4 mr-2" />
              History
            </button>
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
              <button
                onClick={() => scrollToSection('dashboard')}
                className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Clock className="w-4 h-4 mr-3" />
                Dashboard
              </button>
              <button
                onClick={() => scrollToSection('statistics')}
                className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <BarChart3 className="w-4 h-4 mr-3" />
                Statistics
              </button>
              <button
                onClick={() => scrollToSection('history')}
                className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <History className="w-4 h-4 mr-3" />
                History
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
