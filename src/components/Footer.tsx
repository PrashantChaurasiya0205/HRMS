'use client';

import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-8 sm:mt-12 md:mt-16 lg:mt-20">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10 lg:py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
          {/* Logo and Description */}
          <div className="flex items-center gap-3 sm:gap-4">
            <img 
              src="/Gemini_Generated_Image_6dg6126dg6126dg6.png" 
              alt="Workshant Logo" 
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9" 
            />
            <div>
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-800">Workshant</h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">Track your work hours with precision</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            <a
              href="#"
              className="text-xs sm:text-sm md:text-base text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-xs sm:text-sm md:text-base text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-xs sm:text-sm md:text-base text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              Support
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-6 sm:mt-8 md:mt-10 lg:mt-12 pt-4 sm:pt-6 md:pt-8 lg:pt-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6">
            <p className="text-xs sm:text-sm md:text-base text-gray-600 text-center lg:text-left">
              © 2025 Workshant. All rights reserved.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm md:text-base text-gray-600">
              <div className="flex items-center gap-2">
                <img 
                  src="/Gemini_Generated_Image_6dg6126dg6126dg6.png" 
                  alt="Prashant Chaurasiya" 
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full" 
                />
                <span>Made By Prashant Chaurasiya</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-500" />
                <span>for productivity</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
