'use client';

import React from 'react';
import { Clock, Github, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Logo and Description */}
          <div className="flex items-center mb-4 md:mb-0">
            <Clock className="w-6 h-6 text-blue-600 mr-2" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Attendance Monitor</h3>
              <p className="text-sm text-gray-600">Track your work hours with precision</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6">
            <a
              href="#"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Support
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-6 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-gray-600 mb-2 md:mb-0">
              © 2025 Attendance Monitor. All rights reserved.
            </p>
            <div className="flex items-center text-sm text-gray-600">
              <span>Made By Prashant</span>
              <Heart className="w-4 h-4 text-red-500 mx-1" />
              <span>for productivity</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
