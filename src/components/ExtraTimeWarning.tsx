'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ExtraTimeWarningProps {
  isVisible: boolean;
  currentHours: number;
  maxWorkingHours: number;
  onContinue: (reason: string) => void;
  onClockOut: (reason: string) => void;
  onClose: () => void;
}

export default function ExtraTimeWarning({ 
  isVisible, 
  currentHours, 
  maxWorkingHours,
  onContinue, 
  onClockOut, 
  onClose 
}: ExtraTimeWarningProps) {
  const [extraTimeReason, setExtraTimeReason] = useState('');

  useEffect(() => {
    if (isVisible) {
      setExtraTimeReason('');
    }
  }, [isVisible]);

  const handleContinue = () => {
    if (!extraTimeReason.trim()) {
      alert('Please provide a reason for working extra time.');
      return;
    }
    onContinue(extraTimeReason);
  };

  const handleClockOut = () => {
    if (!extraTimeReason.trim()) {
      alert('Please provide a reason for working extra time.');
      return;
    }
    onClockOut(extraTimeReason);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 max-w-md w-full border border-gray-200">
        <div className="flex items-center mb-6">
          <div className="bg-red-100 p-3 rounded-full mr-4">
            <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-black">Maximum Hours Reached</h3>
        </div>
        
        <div className="mb-6">
          <p className="text-base sm:text-lg text-black font-medium mb-2">
            You've worked {currentHours.toFixed(1)} hours (exceeds {maxWorkingHours} hours)
          </p>
          <p className="text-sm sm:text-base text-black">
            Would you like to continue working and track extra hours?
          </p>
        </div>
        
        {/* Extra Time Reason Input */}
        <div className="mb-8">
          <label className="block text-sm sm:text-base font-semibold text-black mb-3">
            Reason for Extra Time <span className="text-red-500">*</span>
          </label>
          <textarea
            value={extraTimeReason}
            onChange={(e) => setExtraTimeReason(e.target.value)}
            placeholder="Please provide a reason for working extra time..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-black placeholder-gray-500 resize-none transition-all duration-200"
            rows={3}
            required
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleContinue}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Continue Working
          </button>
          <button
            onClick={handleClockOut}
            className="flex-1 bg-gray-700 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all duration-200 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Clock Out
          </button>
        </div>
      </div>
    </div>
  );
}
