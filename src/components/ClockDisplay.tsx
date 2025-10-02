'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock, Timer } from 'lucide-react';

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
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="text-center">
        {/* Current Time */}
        <div className="mb-4">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-6 h-6 text-blue-600 mr-2" />
            <span className="text-2xl font-bold text-gray-800">{format(currentTime, 'HH:mm:ss')}</span>
          </div>
          <p className="text-gray-600 text-lg">{format(currentTime, 'EEEE, MMMM do, yyyy')}</p>
        </div>

        {/* Status */}
        <div className="mb-4">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor()} bg-gray-50`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              attendanceStatus.currentStatus === 'WORKING' ? 'bg-green-500' :
              attendanceStatus.currentStatus === 'LUNCH_BREAK' ? 'bg-orange-500' :
              attendanceStatus.currentStatus === 'CLOCKED_OUT' ? 'bg-red-500' : 'bg-gray-500'
            }`}></div>
            {getStatusText()}
          </div>
        </div>

        {/* Session Duration */}
        {sessionStartTime && (
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
        {currentRecord && (
          <div className="mt-4 bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-700 mb-1">Working Hours Today</div>
            <div className="text-2xl font-bold text-green-800">
              {currentRecord.totalWorkingHours.toFixed(2)} hours
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
