'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Coffee, LogOut, Play } from 'lucide-react';
import { useAttendance } from '@/context/AttendanceContext';

export default function ActionButtons() {
  const { state, dispatch } = useAttendance();
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState({
    hasCheckedIn: false,
    hasCheckedOut: false,
    currentStatus: 'IDLE',
    hasCompletedLunch: false
  });
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceStatus();
  }, []);

  const fetchAttendanceStatus = async () => {
    try {
      setStatusLoading(true);
      const response = await fetch('/api/attendance/user-status');
      if (response.ok) {
        const data = await response.json();
        setAttendanceStatus(data);
        
      }
    } catch (error) {
      console.error('Error fetching attendance status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleClockIn = async () => {
    if (attendanceStatus.hasCheckedIn) {
      alert('You have already checked in today!');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/attendance/clock-in', {
        method: 'POST',
      });
      
      if (response.ok) {
        dispatch({ type: 'CLOCK_IN' });
        await fetchAttendanceStatus();
        // Dispatch custom event to refresh progress bar
        window.dispatchEvent(new CustomEvent('attendanceChanged'));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to clock in');
      }
    } catch (error) {
      console.error('Error clocking in:', error);
      alert('Failed to clock in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (attendanceStatus.hasCheckedOut) {
      alert('You have already checked out today!');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/attendance/clock-out', {
        method: 'POST',
      });
      
      if (response.ok) {
        dispatch({ type: 'CLOCK_OUT' });
        await fetchAttendanceStatus();
        // Dispatch custom event to refresh progress bar
        window.dispatchEvent(new CustomEvent('attendanceChanged'));
        alert('Successfully checked out!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to clock out');
      }
    } catch (error) {
      console.error('Error clocking out:', error);
      alert('Failed to clock out');
    } finally {
      setIsLoading(false);
    }
  };


  const handleStartLunch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/attendance/lunch-start', {
        method: 'POST',
      });
      
      if (response.ok) {
        dispatch({ type: 'START_LUNCH' });
        await fetchAttendanceStatus();
        // Dispatch custom event to refresh progress bar
        window.dispatchEvent(new CustomEvent('attendanceChanged'));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to start lunch');
      }
    } catch (error) {
      console.error('Error starting lunch:', error);
      alert('Failed to start lunch');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndLunch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/attendance/lunch-end', {
        method: 'POST',
      });
      
      if (response.ok) {
        dispatch({ type: 'END_LUNCH' });
        // Mark lunch as completed
        setAttendanceStatus(prev => ({
          ...prev,
          hasCompletedLunch: true,
          currentStatus: 'WORKING'
        }));
        await fetchAttendanceStatus();
        // Dispatch custom event to refresh progress bar
        window.dispatchEvent(new CustomEvent('attendanceChanged'));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to end lunch');
      }
    } catch (error) {
      console.error('Error ending lunch:', error);
      alert('Failed to end lunch');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonConfig = () => {
    // Use API status instead of local state
    const status = attendanceStatus.currentStatus;
    
    // Check if day is completed first
    if (attendanceStatus.hasCheckedOut) {
      return {
        primary: {
          text: 'Day Completed',
          icon: Clock,
          onClick: () => alert('You have already completed your day!'),
          className: 'bg-gray-400 cursor-not-allowed text-white',
          disabled: true,
        },
        secondary: null,
      };
    }

    // Check if not checked in yet
    if (!attendanceStatus.hasCheckedIn) {
      return {
        primary: {
          text: 'Clock In',
          icon: Play,
          onClick: handleClockIn,
          className: 'bg-green-600 hover:bg-green-700 text-white',
          disabled: isLoading,
        },
        secondary: null,
      };
    }

    // Handle different working states
    switch (status) {
      case 'WORKING':
        // Check if lunch has already been completed
        if (attendanceStatus.hasCompletedLunch) {
          return {
            primary: {
              text: 'Clock Out',
              icon: LogOut,
              onClick: handleClockOut,
              className: 'bg-red-600 hover:bg-red-700 text-white',
              disabled: isLoading,
            },
            secondary: null,
          };
        }
        
        return {
          primary: {
            text: 'Start Lunch',
            icon: Coffee,
            onClick: handleStartLunch,
            className: 'bg-orange-600 hover:bg-orange-700 text-white',
            disabled: isLoading,
          },
          secondary: {
            text: 'Clock Out',
            icon: LogOut,
            onClick: handleClockOut,
            className: 'bg-red-600 hover:bg-red-700 text-white',
            disabled: isLoading,
          },
        };
      
      case 'LUNCH_BREAK':
        return {
          primary: {
            text: 'End Lunch',
            icon: Clock,
            onClick: handleEndLunch,
            className: 'bg-blue-600 hover:bg-blue-700 text-white',
            disabled: isLoading,
          },
          secondary: {
            text: 'Clock Out',
            icon: LogOut,
            onClick: handleClockOut,
            className: 'bg-red-600 hover:bg-red-700 text-white',
            disabled: isLoading,
          },
        };
      
      case 'CLOCKED_OUT':
        // This should not happen if hasCheckedOut is false, but just in case
        return {
          primary: {
            text: 'Day Completed',
            icon: Clock,
            onClick: () => alert('You have already completed your day!'),
            className: 'bg-gray-400 cursor-not-allowed text-white',
            disabled: true,
          },
          secondary: null,
        };
      
      default:
        // Default to clock in if status is unclear
        return {
          primary: {
            text: 'Clock In',
            icon: Play,
            onClick: handleClockIn,
            className: 'bg-green-600 hover:bg-green-700 text-white',
            disabled: isLoading,
          },
          secondary: null,
        };
    }
  };

  const buttonConfig = getButtonConfig();

  if (statusLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Actions</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Loading status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Actions</h3>
      
      <div className="space-y-3 sm:space-y-4">
        {/* Primary Action */}
        <button
          onClick={buttonConfig.primary.onClick}
          disabled={buttonConfig.primary.disabled || isLoading}
          className={`w-full flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 transform ${
            buttonConfig.primary.disabled || isLoading 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:scale-105'
          } ${buttonConfig.primary.className}`}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
          ) : (
            <buttonConfig.primary.icon className="w-6 h-6 mr-3" />
          )}
          {buttonConfig.primary.text}
        </button>

        {/* Secondary Action */}
        {buttonConfig.secondary && (
          <button
            onClick={buttonConfig.secondary.onClick}
            disabled={buttonConfig.secondary.disabled || isLoading}
            className={`w-full flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 transform ${
              buttonConfig.secondary.disabled || isLoading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:scale-105'
            } ${buttonConfig.secondary.className}`}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
            ) : (
              <buttonConfig.secondary.icon className="w-6 h-6 mr-3" />
            )}
            {buttonConfig.secondary.text}
          </button>
        )}
      </div>

      {/* Status Info */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
        <div className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Current Status:</div>
        <div className="font-semibold text-gray-800 text-sm sm:text-base">
          {attendanceStatus.hasCheckedOut && 'Day completed'}
          {!attendanceStatus.hasCheckedIn && !attendanceStatus.hasCheckedOut && 'Ready to start your day'}
          {attendanceStatus.hasCheckedIn && attendanceStatus.currentStatus === 'WORKING' && 'Currently working'}
          {attendanceStatus.hasCheckedIn && attendanceStatus.currentStatus === 'LUNCH_BREAK' && 'On lunch break'}
        </div>
      </div>

    </div>
  );
}
