'use client';

import React from 'react';
import { format } from 'date-fns';
import { Clock, Timer } from 'lucide-react';
import { useAttendance } from '@/context/AttendanceContext';
import { getSessionDuration } from '@/utils/timeCalculations';

export default function ClockDisplay() {
  const { state } = useAttendance();
  
  const currentTime = format(state.currentTime, 'HH:mm:ss');
  const currentDate = format(state.currentTime, 'EEEE, MMMM do, yyyy');
  
  const getSessionDurationDisplay = () => {
    if (!state.sessionStartTime) return '00:00:00';
    return getSessionDuration(state.sessionStartTime);
  };

  const getStatusColor = () => {
    switch (state.status) {
      case 'WORKING':
        return 'text-green-600';
      case 'LUNCH_BREAK':
        return 'text-orange-600';
      case 'CLOCKED_OUT':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (state.status) {
      case 'WORKING':
        return 'Working';
      case 'LUNCH_BREAK':
        return 'On Lunch Break';
      case 'CLOCKED_OUT':
        return 'Clock Out Complete';
      default:
        return 'Ready to Clock In';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="text-center">
        {/* Current Time */}
        <div className="mb-4">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-6 h-6 text-blue-600 mr-2" />
            <span className="text-2xl font-bold text-gray-800">{currentTime}</span>
          </div>
          <p className="text-gray-600 text-lg">{currentDate}</p>
        </div>

        {/* Status */}
        <div className="mb-4">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor()} bg-gray-50`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              state.status === 'WORKING' ? 'bg-green-500' :
              state.status === 'LUNCH_BREAK' ? 'bg-orange-500' :
              state.status === 'CLOCKED_OUT' ? 'bg-red-500' : 'bg-gray-500'
            }`}></div>
            {getStatusText()}
          </div>
        </div>

        {/* Session Duration */}
        {state.sessionStartTime && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <Timer className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-lg font-semibold text-blue-800">Session Duration</span>
            </div>
            <div className="text-3xl font-bold text-blue-900">
              {getSessionDurationDisplay()}
            </div>
          </div>
        )}

        {/* Working Hours Today */}
        {state.currentRecord && (
          <div className="mt-4 bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-700 mb-1">Working Hours Today</div>
            <div className="text-2xl font-bold text-green-800">
              {state.currentRecord.totalWorkingHours.toFixed(2)} hours
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
