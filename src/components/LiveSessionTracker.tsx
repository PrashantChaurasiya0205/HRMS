'use client';

import React, { useState, useEffect } from 'react';
import ExtraTimeWarning from './ExtraTimeWarning';

interface LiveSessionTrackerProps {
  isWorking: boolean;
  clockInTime?: Date;
  lunchDuration?: number;
}

export default function LiveSessionTracker({ 
  isWorking, 
  clockInTime, 
  lunchDuration = 0 
}: LiveSessionTrackerProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWarning, setShowWarning] = useState(false);
  const [hasShownWarning, setHasShownWarning] = useState(false);
  const [currentWorkingHours, setCurrentWorkingHours] = useState(0);
  const [maxWorkingHours, setMaxWorkingHours] = useState(8);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    fetchWorkingHours();
    return () => clearInterval(timer);
  }, []);

  const fetchWorkingHours = async () => {
    try {
      const response = await fetch('/api/system/working-hours');
      if (response.ok) {
        const data = await response.json();
        setMaxWorkingHours(data.dailyHours || 8);
      }
    } catch (error) {
      console.error('Error fetching working hours:', error);
    }
  };

  useEffect(() => {
    if (isWorking && clockInTime) {
      const elapsed = currentTime.getTime() - clockInTime.getTime();
      const totalHours = elapsed / (1000 * 60 * 60);
      const workingHours = Math.max(0, totalHours - lunchDuration);
      setCurrentWorkingHours(workingHours);

      // Check if warning has already been shown today
      const today = new Date().toLocaleDateString('en-CA');
      const warningShownToday = localStorage.getItem('extraTimeWarningShown');
      const lastWarningDate = localStorage.getItem('lastWarningDate');
      
      // Reset warning if it's a new day
      if (lastWarningDate !== today) {
        localStorage.removeItem('extraTimeWarningShown');
        localStorage.removeItem('lastWarningDate');
        setHasShownWarning(false);
      }

      // Show warning when max hours are reached (only once per session)
      if (workingHours >= maxWorkingHours && !hasShownWarning && !warningShownToday) {
        setShowWarning(true);
        setHasShownWarning(true);
        localStorage.setItem('lastWarningDate', today);
      }
    }
  }, [currentTime, isWorking, clockInTime, lunchDuration, hasShownWarning]);

  // Reset warning state when component mounts
  useEffect(() => {
    const today = new Date().toLocaleDateString('en-CA');
    const lastWarningDate = localStorage.getItem('lastWarningDate');
    
    if (lastWarningDate !== today) {
      localStorage.removeItem('extraTimeWarningShown');
      localStorage.removeItem('lastWarningDate');
      setHasShownWarning(false);
    } else {
      // If warning was shown today, set hasShownWarning to true
      const warningShownToday = localStorage.getItem('extraTimeWarningShown');
      if (warningShownToday) {
        setHasShownWarning(true);
      }
    }
  }, []);

  const handleContinue = async (reason: string) => {
    try {
      // Calculate and save extra time immediately
      const today = new Date().toLocaleDateString('en-CA');
      const recordsResponse = await fetch('/api/attendance/records');
      if (recordsResponse.ok) {
        const records = await recordsResponse.json();
        const todayRecord = records.find((record: any) => record.date === today);
        
        if (todayRecord) {
          // Calculate current working hours
          const now = new Date();
          const elapsed = now.getTime() - new Date(todayRecord.clockIn).getTime();
          const totalHours = elapsed / (1000 * 60 * 60);
          const lunchDuration = todayRecord.lunchDuration || 0;
          const finalWorkingHours = Math.max(0, totalHours - lunchDuration);
          
          const maxHours = maxWorkingHours;
          const regularHours = Math.min(finalWorkingHours, maxHours);
          const extraHours = Math.max(0, finalWorkingHours - maxHours);

          const response = await fetch('/api/attendance/update-extra-time', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              recordId: todayRecord._id,
              extraTimeReason: reason,
              isContinuing: true,
              isExtraTimeEnabled: true,
              regularHours,
              extraHours,
              totalWorkingHours: finalWorkingHours
            }),
          });
          
          if (response.ok) {
            setShowWarning(false);
            localStorage.setItem('extraTimeWarningShown', 'true');
            window.location.reload();
          } else {
            console.error('Failed to update extra time');
          }
        }
      }
    } catch (error) {
      console.error('Error updating extra time:', error);
    }
  };

  const handleClockOut = async (reason: string) => {
    try {
      // Update the current attendance record with extra time reason and clock out
      const today = new Date().toLocaleDateString('en-CA');
      const recordsResponse = await fetch('/api/attendance/records');
      if (recordsResponse.ok) {
        const records = await recordsResponse.json();
        const todayRecord = records.find((record: any) => record.date === today);
        
        if (todayRecord) {
          const response = await fetch('/api/attendance/update-extra-time', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              recordId: todayRecord._id,
              extraTimeReason: reason,
              isContinuing: false,
              isExtraTimeEnabled: true
            }),
          });
          
          if (response.ok) {
            setShowWarning(false);
            // Store in localStorage that warning has been shown for this session
            localStorage.setItem('extraTimeWarningShown', 'true');
            // Trigger clock out
            const clockOutResponse = await fetch('/api/attendance/clock-out', {
              method: 'POST',
            });
            if (clockOutResponse.ok) {
              window.location.reload(); // Refresh to update status
            }
          } else {
            console.error('Failed to update extra time reason');
          }
        }
      }
    } catch (error) {
      console.error('Error updating extra time:', error);
    }
  };

  const handleClose = () => {
    setShowWarning(false);
  };

  return (
    <ExtraTimeWarning
      isVisible={showWarning}
      currentHours={currentWorkingHours}
      maxWorkingHours={maxWorkingHours}
      onContinue={handleContinue}
      onClockOut={handleClockOut}
      onClose={handleClose}
    />
  );
}
