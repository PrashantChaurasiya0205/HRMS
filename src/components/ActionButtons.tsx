'use client';

import React from 'react';
import { Clock, Coffee, LogOut, Play } from 'lucide-react';
import { useAttendance } from '@/context/AttendanceContext';

export default function ActionButtons() {
  const { state, dispatch } = useAttendance();

  const handleClockIn = () => {
    dispatch({ type: 'CLOCK_IN' });
  };

  const handleClockOut = () => {
    dispatch({ type: 'CLOCK_OUT' });
  };

  const handleStartLunch = () => {
    dispatch({ type: 'START_LUNCH' });
  };

  const handleEndLunch = () => {
    dispatch({ type: 'END_LUNCH' });
  };

  const getButtonConfig = () => {
    switch (state.status) {
      case 'IDLE':
        return {
          primary: {
            text: 'Clock In',
            icon: Play,
            onClick: handleClockIn,
            className: 'bg-green-600 hover:bg-green-700 text-white',
          },
          secondary: null,
        };
      
      case 'WORKING':
        return {
          primary: {
            text: 'Start Lunch',
            icon: Coffee,
            onClick: handleStartLunch,
            className: 'bg-orange-600 hover:bg-orange-700 text-white',
          },
          secondary: {
            text: 'Clock Out',
            icon: LogOut,
            onClick: handleClockOut,
            className: 'bg-red-600 hover:bg-red-700 text-white',
          },
        };
      
      case 'LUNCH_BREAK':
        return {
          primary: {
            text: 'End Lunch',
            icon: Clock,
            onClick: handleEndLunch,
            className: 'bg-blue-600 hover:bg-blue-700 text-white',
          },
          secondary: {
            text: 'Clock Out',
            icon: LogOut,
            onClick: handleClockOut,
            className: 'bg-red-600 hover:bg-red-700 text-white',
          },
        };
      
      case 'CLOCKED_OUT':
        return {
          primary: {
            text: 'Clock In',
            icon: Play,
            onClick: handleClockIn,
            className: 'bg-green-600 hover:bg-green-700 text-white',
          },
          secondary: null,
        };
      
      default:
        return {
          primary: {
            text: 'Clock In',
            icon: Play,
            onClick: handleClockIn,
            className: 'bg-green-600 hover:bg-green-700 text-white',
          },
          secondary: null,
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Actions</h3>
      
      <div className="space-y-4">
        {/* Primary Action */}
        <button
          onClick={buttonConfig.primary.onClick}
          className={`w-full flex items-center justify-center px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 ${buttonConfig.primary.className}`}
        >
          <buttonConfig.primary.icon className="w-6 h-6 mr-3" />
          {buttonConfig.primary.text}
        </button>

        {/* Secondary Action */}
        {buttonConfig.secondary && (
          <button
            onClick={buttonConfig.secondary.onClick}
            className={`w-full flex items-center justify-center px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 ${buttonConfig.secondary.className}`}
          >
            <buttonConfig.secondary.icon className="w-6 h-6 mr-3" />
            {buttonConfig.secondary.text}
          </button>
        )}
      </div>

      {/* Status Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600 mb-2">Current Status:</div>
        <div className="font-semibold text-gray-800">
          {state.status === 'IDLE' && 'Ready to start your day'}
          {state.status === 'WORKING' && 'Currently working'}
          {state.status === 'LUNCH_BREAK' && 'On lunch break'}
          {state.status === 'CLOCKED_OUT' && 'Day completed'}
        </div>
      </div>
    </div>
  );
}
