'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock, Timer } from 'lucide-react';
import LiveSessionTracker from './LiveSessionTracker';

export default function ClockDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState({
    hasCheckedIn: false,
    hasCheckedOut: false,
    currentStatus: 'IDLE'
  });
  const [currentRecord, setCurrentRecord] = useState<any>(null);

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Load session start time from localStorage
    const savedSessionTime = localStorage.getItem('sessionStartTime');
    if (savedSessionTime) {
      setSessionStartTime(new Date(savedSessionTime));
    }

    // Fetch attendance status
    fetchAttendanceStatus();

    return () => clearInterval(timer);
  }, []);

  const fetchAttendanceStatus = async () => {
    try {
      const response = await fetch('/api/attendance/status');
      if (response.ok) {
        const data = await response.json();
        setAttendanceStatus(data);
        
        // If checked in, set session start time
        if (data.hasCheckedIn && !sessionStartTime) {
          const today = new Date().toLocaleDateString('en-CA');
          const recordsResponse = await fetch('/api/attendance/records');
          if (recordsResponse.ok) {
            const records = await recordsResponse.json();
            const todayRecord = records.find((record: any) => record.date === today);
            if (todayRecord) {
              const clockInTime = new Date(todayRecord.clockIn);
              setSessionStartTime(clockInTime);
              localStorage.setItem('sessionStartTime', clockInTime.toISOString());
              setCurrentRecord(todayRecord);
            }
          }
        }
        
        // If checked out, clear session
        if (data.hasCheckedOut) {
          setSessionStartTime(null);
          localStorage.removeItem('sessionStartTime');
        }
      }
    } catch (error) {
      console.error('Error fetching attendance status:', error);
    }
  };
  
  const getSessionDurationDisplay = () => {
    if (!sessionStartTime) return '00:00:00';
    
    const elapsed = currentTime.getTime() - sessionStartTime.getTime();
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getCurrentWorkingHours = () => {
    if (!sessionStartTime || attendanceStatus.currentStatus === 'CLOCKED_OUT') return 0;
    
    const elapsed = currentTime.getTime() - sessionStartTime.getTime();
    const totalHours = elapsed / (1000 * 60 * 60);
    
    // Subtract lunch duration if applicable
    const lunchDuration = currentRecord?.lunchDuration || 0;
    return Math.max(0, totalHours - lunchDuration);
  };


  const getStatusColor = () => {
    switch (attendanceStatus.currentStatus) {
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
    switch (attendanceStatus.currentStatus) {
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
    <div className="bg-white rounded-xl shadow-lg p-3 xs:p-4 sm:p-6 mb-3 xs:mb-4 sm:mb-6">
      <div className="text-center">
        {/* Current Time */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center justify-center mb-1 sm:mb-2">
            <Clock className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600 mr-1 xs:mr-1.5 sm:mr-2" />
            <span className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">{format(currentTime, 'HH:mm:ss')}</span>
          </div>
          <p className="text-gray-600 text-xs xs:text-sm sm:text-base lg:text-lg px-2">{format(currentTime, 'EEEE, MMMM do, yyyy')}</p>
        </div>

        {/* Status */}
        <div className="mb-2 xs:mb-3 sm:mb-4">
          <div className={`inline-flex items-center px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 rounded-full text-xs xs:text-sm sm:text-base font-medium ${getStatusColor()} bg-gray-50`}>
            <div className={`w-1 h-1 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 rounded-full mr-1 xs:mr-1.5 sm:mr-2 ${
              attendanceStatus.currentStatus === 'WORKING' ? 'bg-green-500' :
              attendanceStatus.currentStatus === 'LUNCH_BREAK' ? 'bg-orange-500' :
              attendanceStatus.currentStatus === 'CLOCKED_OUT' ? 'bg-red-500' : 'bg-gray-500'
            }`}></div>
            <span className="text-xs xs:text-sm sm:text-base">{getStatusText()}</span>
          </div>
        </div>

        {/* Session Duration */}
        {sessionStartTime && (
          <div className="bg-blue-50 rounded-lg p-2 xs:p-3 sm:p-4 lg:p-5">
            <div className="flex items-center justify-center mb-1 sm:mb-2">
              <Timer className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600 mr-1 xs:mr-1.5 sm:mr-2" />
              <span className="text-xs xs:text-sm sm:text-base lg:text-lg font-semibold text-blue-800">Session Duration</span>
            </div>
            <div className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-blue-900">
              {getSessionDurationDisplay()}
            </div>
          </div>
        )}

        {/* Working Hours Today */}
        {currentRecord && (
          <div className="mt-3 sm:mt-4 bg-green-50 rounded-lg p-2 xs:p-3 sm:p-4 lg:p-5">
            <div className="text-xs xs:text-sm sm:text-base text-green-700 mb-1">Working Hours Today</div>
            <div className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-green-800">
              {Math.floor(currentRecord.totalWorkingHours)}h {Math.floor((currentRecord.totalWorkingHours % 1) * 60)}m
            </div>
          </div>
        )}
      </div>

      {/* Live Session Tracker for Extra Time Warning */}
      {attendanceStatus.currentStatus === 'WORKING' && sessionStartTime && (
        <LiveSessionTracker
          isWorking={attendanceStatus.currentStatus === 'WORKING'}
          clockInTime={sessionStartTime}
          lunchDuration={currentRecord?.lunchDuration || 0}
        />
      )}
    </div>
  );
}
