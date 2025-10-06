'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock } from 'lucide-react';

interface AttendanceStatus {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  currentStatus: string;
}

interface AttendanceRecord {
  _id: string;
  userId: string;
  date: string;
  clockIn: string; // ISO date string from database
  clockOut?: string; // ISO date string from database
  lunchStart?: string; // ISO date string from database
  lunchEnd?: string; // ISO date string from database
  totalWorkingHours: number;
  lunchDuration: number;
  status: string;
}

export default function TodaysProgressOnly() {
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>({
    hasCheckedIn: false,
    hasCheckedOut: false,
    currentStatus: 'IDLE'
  });
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [maxWorkingHours, setMaxWorkingHours] = useState(8);

  useEffect(() => {
    // Initial data fetch
    const initializeData = async () => {
      await Promise.all([
        fetchAttendanceStatus(),
        fetchTodayRecord(),
        fetchWorkingHours()
      ]);
    };
    
    initializeData();
    
    // Update time every second for real-time progress
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Refresh status only when actively working
    const refreshTimer = setInterval(() => {
      // Only refresh if user is currently working (has checked in but not out)
      if (attendanceStatus.hasCheckedIn && !attendanceStatus.hasCheckedOut) {
        fetchAttendanceStatus();
        fetchTodayRecord();
      }
    }, 10000); // Refresh every 10 seconds, but only when working

    // Listen for attendance changes
    const handleAttendanceChange = () => {
      fetchAttendanceStatus();
      fetchTodayRecord();
    };

    window.addEventListener('attendanceChanged', handleAttendanceChange);

    return () => {
      clearInterval(timer);
      clearInterval(refreshTimer);
      window.removeEventListener('attendanceChanged', handleAttendanceChange);
    };
  }, []);

  const fetchAttendanceStatus = async () => {
    try {
      const response = await fetch('/api/attendance/status');
      if (response.ok) {
        const data = await response.json();
        setAttendanceStatus(data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching attendance status:', error);
      setLoading(false);
    }
  };

  const fetchTodayRecord = async () => {
    try {
      const response = await fetch('/api/attendance/records');
      if (response.ok) {
        const data = await response.json();
        const today = new Date().toLocaleDateString('en-CA');
        const todayRecord = data.find((record: AttendanceRecord) => record.date === today);
        setTodayRecord(todayRecord || null);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching today record:', error);
      setLoading(false);
    }
  };

  const fetchWorkingHours = async () => {
    try {
      const response = await fetch('/api/working-hours');
      if (response.ok) {
        const data = await response.json();
        setMaxWorkingHours(data.workingHours?.dailyHours || 8);
      }
    } catch (error) {
      console.error('Error fetching working hours:', error);
    }
  };

  const getProgressPercentage = (current: number, target: number = maxWorkingHours) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    // If on lunch break, show green color
    if (attendanceStatus.currentStatus === 'LUNCH_BREAK') {
      return 'from-green-500 to-green-600';
    }
    
    // For all other times, show red color
    return 'from-red-500 to-red-600';
  };

  // Calculate session time using actual clock-in time from database
  const calculateSessionTime = () => {
    if (!todayRecord) {
      return { hours: 0, percentage: 0, isActive: false, segments: [], totalHours: 0 };
    }

    // Use actual clock-in time from database (ISO string)
    const clockInTime = new Date(todayRecord.clockIn);
    let now = new Date();
    
    // Check if clockInTime is valid
    if (isNaN(clockInTime.getTime())) {
      console.error('Invalid clock-in time:', todayRecord.clockIn);
      return { hours: 0, percentage: 0, isActive: false, segments: [], totalHours: 0 };
    }

    // If clocked out, use clock-out time instead of current time
    if (attendanceStatus.hasCheckedOut && todayRecord.clockOut) {
      now = new Date(todayRecord.clockOut);
    }
    
    const elapsed = now.getTime() - clockInTime.getTime();
    const elapsedHours = elapsed / (1000 * 60 * 60);
    
    // Calculate segments for different time periods
    const segments = [];
    const totalMinutes = elapsed / (1000 * 60);
    const targetMinutes = maxWorkingHours * 60; // max hours in minutes
    
    // Calculate total working hours including lunch time
    let totalWorkingHours = elapsedHours;
    
    if (todayRecord.lunchStart && todayRecord.lunchEnd) {
      const lunchStart = new Date(todayRecord.lunchStart);
      const lunchEnd = new Date(todayRecord.lunchEnd);
      
      // Working time before lunch
      const beforeLunchMinutes = (lunchStart.getTime() - clockInTime.getTime()) / (1000 * 60);
      if (beforeLunchMinutes > 0) {
        const beforeLunchWidth = Math.min((beforeLunchMinutes / targetMinutes) * 100, 100);
        segments.push({
          type: 'working',
          width: beforeLunchWidth,
          label: 'Working'
        });
      }
      
      // Lunch time
      const lunchMinutes = (lunchEnd.getTime() - lunchStart.getTime()) / (1000 * 60);
      if (lunchMinutes > 0) {
        const lunchWidth = Math.min((lunchMinutes / targetMinutes) * 100, 100);
        segments.push({
          type: 'lunch',
          width: lunchWidth,
          label: 'Lunch Break'
        });
      }
      
      // Working time after lunch
      const afterLunchMinutes = (now.getTime() - lunchEnd.getTime()) / (1000 * 60);
      if (afterLunchMinutes > 0) {
        const afterLunchWidth = Math.min((afterLunchMinutes / targetMinutes) * 100, 100);
        segments.push({
          type: 'working',
          width: afterLunchWidth,
          label: 'Working'
        });
      }
    } else if (todayRecord.lunchStart && !todayRecord.lunchEnd) {
      // Currently on lunch break
      const beforeLunchMinutes = (new Date(todayRecord.lunchStart).getTime() - clockInTime.getTime()) / (1000 * 60);
      const currentLunchMinutes = (now.getTime() - new Date(todayRecord.lunchStart).getTime()) / (1000 * 60);
      
      if (beforeLunchMinutes > 0) {
        const beforeLunchWidth = Math.min((beforeLunchMinutes / targetMinutes) * 100, 100);
        segments.push({
          type: 'working',
          width: beforeLunchWidth,
          label: 'Working'
        });
      }
      
      if (currentLunchMinutes > 0) {
        const lunchWidth = Math.min((currentLunchMinutes / targetMinutes) * 100, 100);
        segments.push({
          type: 'lunch',
          width: lunchWidth,
          label: 'Lunch Break'
        });
      }
    } else {
      // No lunch taken yet
      const workingWidth = Math.min((totalMinutes / targetMinutes) * 100, 100);
      segments.push({
        type: 'working',
        width: workingWidth,
        label: 'Working'
      });
    }
    
    // Calculate total hours including lunch time
    const totalHours = Math.max(0, elapsedHours);
    
    return {
      hours: Math.max(0, elapsedHours),
      percentage: getProgressPercentage(totalHours),
      isActive: !attendanceStatus.hasCheckedOut,
      segments,
      totalHours
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Today's Progress
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Loading progress...</span>
        </div>
      </div>
    );
  }

  const sessionTime = calculateSessionTime();
  const progressColor = getProgressColor(sessionTime.percentage);

  // Show different states based on attendance status
  if (!attendanceStatus.hasCheckedIn && !todayRecord) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Today's Progress
        </h3>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Clock in to start tracking your progress</p>
        </div>
      </div>
    );
  }

  // If no record found but should show progress, show loading
  if (!todayRecord) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Today's Progress
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Loading progress...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
        Today's Progress
        {sessionTime.isActive && (
          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full animate-pulse">
            LIVE
          </span>
        )}
        {attendanceStatus.currentStatus === 'LUNCH_BREAK' && (
          <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full animate-pulse">
            LUNCH BREAK
          </span>
        )}
      </h3>

      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <span className="text-sm font-medium text-gray-700">Today's Progress</span>
          <span className="text-sm text-gray-600">
            {Math.floor(sessionTime.totalHours)}h {Math.floor((sessionTime.totalHours % 1) * 60)}m / {maxWorkingHours}h
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 relative overflow-hidden">
          {sessionTime.segments.map((segment, index) => {
            const leftPosition = sessionTime.segments.slice(0, index).reduce((sum, s) => sum + s.width, 0);
            const segmentWidth = Math.min(segment.width, 100 - leftPosition);
            
            return (
              <div
                key={index}
                className={`absolute top-0 h-2 rounded-full transition-all duration-500 cursor-pointer group ${
                  segment.type === 'lunch' 
                    ? 'bg-gradient-to-r from-green-500 to-green-600' 
                    : 'bg-gradient-to-r from-red-500 to-red-600'
                }`}
                style={{ 
                  width: `${segmentWidth}%`,
                  left: `${leftPosition}%`
                }}
              >
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  {segment.label}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 mt-2">
          <div className="text-xs text-gray-500">
            {sessionTime.percentage.toFixed(0)}% of daily target
          </div>
          <div className="text-xs text-gray-500">
            Clocked in at: {todayRecord?.clockIn ? new Date(todayRecord.clockIn).toLocaleTimeString() : 'N/A'}
          </div>
        </div>
        {attendanceStatus.hasCheckedOut && todayRecord?.clockOut && (
          <div className="text-xs text-gray-500 mt-1">
            Clocked out at: {new Date(todayRecord.clockOut).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}
