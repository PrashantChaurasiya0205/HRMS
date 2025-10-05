'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { TrendingUp, Calendar, Clock, Target, AlertTriangle } from 'lucide-react';

interface AttendanceRecord {
  _id: string;
  userId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  lunchStart?: string;
  lunchEnd?: string;
  totalWorkingHours: number;
  lunchDuration: number;
  status: string;
}

export default function Statistics() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [maxWorkingHours, setMaxWorkingHours] = useState(8); // Set maximum working hours
  const [extraTimeReason, setExtraTimeReason] = useState('');

  useEffect(() => {
    fetchRecords();
    fetchWorkingHours();
  }, []);

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

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/attendance/records');
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      } else {
        console.error('Failed to fetch records');
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const statistics = useMemo(() => {
    const now = new Date();
    const startOfThisWeek = startOfWeek(now);
    const endOfThisWeek = endOfWeek(now);
    const startOfThisMonth = startOfMonth(now);
    const endOfThisMonth = endOfMonth(now);

    // Filter records for this week and month
    const thisWeekRecords = records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startOfThisWeek && recordDate <= endOfThisWeek;
    });

    const thisMonthRecords = records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startOfThisMonth && recordDate <= endOfThisMonth;
    });

    // Calculate totals
    const totalHours = records.reduce((sum, record) => sum + record.totalWorkingHours, 0);
    const weekHours = thisWeekRecords.reduce((sum, record) => sum + record.totalWorkingHours, 0);
    const monthHours = thisMonthRecords.reduce((sum, record) => sum + record.totalWorkingHours, 0);

    // Calculate extra hours (overtime)
    const totalExtraHours = records.reduce((sum, record) => {
      const extraHours = Math.max(0, record.totalWorkingHours - maxWorkingHours);
      return sum + extraHours;
    }, 0);

    const weekExtraHours = thisWeekRecords.reduce((sum, record) => {
      const extraHours = Math.max(0, record.totalWorkingHours - maxWorkingHours);
      return sum + extraHours;
    }, 0);

    const monthExtraHours = thisMonthRecords.reduce((sum, record) => {
      const extraHours = Math.max(0, record.totalWorkingHours - maxWorkingHours);
      return sum + extraHours;
    }, 0);

    // Calculate regular hours (within max limit)
    const totalRegularHours = records.reduce((sum, record) => {
      const regularHours = Math.min(record.totalWorkingHours, maxWorkingHours);
      return sum + regularHours;
    }, 0);

    const weekRegularHours = thisWeekRecords.reduce((sum, record) => {
      const regularHours = Math.min(record.totalWorkingHours, maxWorkingHours);
      return sum + regularHours;
    }, 0);

    const monthRegularHours = thisMonthRecords.reduce((sum, record) => {
      const regularHours = Math.min(record.totalWorkingHours, maxWorkingHours);
      return sum + regularHours;
    }, 0);

    // Calculate averages
    const avgDailyHours = records.length > 0 ? totalHours / records.length : 0;
    const avgWeekHours = thisWeekRecords.length > 0 ? weekHours / thisWeekRecords.length : 0;

    // Calculate working days
    const workingDays = records.filter(record => record.totalWorkingHours > 0).length;
    const overtimeDays = records.filter(record => record.totalWorkingHours > maxWorkingHours).length;

    return {
      totalHours,
      weekHours,
      monthHours,
      avgDailyHours,
      avgWeekHours,
      workingDays,
      totalRecords: records.length,
      totalExtraHours,
      weekExtraHours,
      monthExtraHours,
      totalRegularHours,
      weekRegularHours,
      monthRegularHours,
      overtimeDays,
    };
  }, [records, maxWorkingHours]);

  const getProgressPercentage = (current: number, target: number = maxWorkingHours) => {
    return Math.min((current / target) * 100, 100);
  };

  const handleContinueWorking = async () => {
    if (!extraTimeReason.trim()) {
      alert('Please provide a reason for working extra time.');
      return;
    }
    
    try {
      // Update the current attendance record with extra time reason
      const today = new Date().toLocaleDateString('en-CA');
      const todayRecord = records.find(record => record.date === today);
      
      if (todayRecord) {
        const response = await fetch('/api/attendance/update-extra-time', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recordId: todayRecord._id,
            extraTimeReason: extraTimeReason,
            isContinuing: true
          }),
        });
        
        if (response.ok) {
          setShowWarning(false);
          setExtraTimeReason('');
          // Refresh records to show updated data
          fetchRecords();
        } else {
          console.error('Failed to update extra time reason');
        }
      }
    } catch (error) {
      console.error('Error updating extra time:', error);
    }
  };

  const handleClockOut = async () => {
    try {
      // Update the current attendance record with extra time reason and clock out
      const today = new Date().toLocaleDateString('en-CA');
      const todayRecord = records.find(record => record.date === today);
      
      if (todayRecord) {
        const response = await fetch('/api/attendance/update-extra-time', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recordId: todayRecord._id,
            extraTimeReason: extraTimeReason,
            isContinuing: false
          }),
        });
        
        if (response.ok) {
          setShowWarning(false);
          setExtraTimeReason('');
          // Refresh records to show updated data
          fetchRecords();
        } else {
          console.error('Failed to update extra time reason');
        }
      }
    } catch (error) {
      console.error('Error updating extra time:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 text-blue-600" />
          <span className="text-sm sm:text-base lg:text-lg">Statistics</span>
        </h3>
        <div className="flex items-center justify-center py-6 sm:py-8 lg:py-10">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 border-b-2 border-blue-600 mr-2 sm:mr-3"></div>
          <span className="text-xs sm:text-sm lg:text-base text-gray-600">Loading statistics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
      <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 text-blue-600" />
        <span className="text-sm sm:text-base lg:text-lg">Statistics</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
        {/* Total Hours */}
        <div className="bg-blue-50 rounded-lg p-3 sm:p-4 lg:p-5">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
            <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-blue-800">{statistics.totalHours.toFixed(1)}h</span>
          </div>
          <div className="text-xs sm:text-sm lg:text-base text-blue-600">Total Hours</div>
        </div>

        {/* This Week */}
        <div className="bg-green-50 rounded-lg p-3 sm:p-4 lg:p-5">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
            <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-green-800">{statistics.weekHours.toFixed(1)}h</span>
          </div>
          <div className="text-xs sm:text-sm lg:text-base text-green-600">This Week</div>
        </div>

        {/* This Month */}
        <div className="bg-purple-50 rounded-lg p-3 sm:p-4 lg:p-5">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" />
            <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-purple-800">{statistics.monthHours.toFixed(1)}h</span>
          </div>
          <div className="text-xs sm:text-sm lg:text-base text-purple-600">This Month</div>
        </div>

        {/* Average Daily */}
        <div className="bg-orange-50 rounded-lg p-3 sm:p-4 lg:p-5">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" />
            <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-orange-800">{statistics.avgDailyHours.toFixed(1)}h</span>
          </div>
          <div className="text-xs sm:text-sm lg:text-base text-orange-600">Avg Daily</div>
        </div>

        {/* Working Days */}
        <div className="bg-indigo-50 rounded-lg p-3 sm:p-4 lg:p-5">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-indigo-600" />
            <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-indigo-800">{statistics.workingDays}</span>
          </div>
          <div className="text-xs sm:text-sm lg:text-base text-indigo-600">Working Days</div>
        </div>

        {/* Total Records */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 lg:p-5">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600" />
            <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800">{statistics.totalRecords}</span>
          </div>
          <div className="text-xs sm:text-sm lg:text-base text-gray-600">Total Records</div>
        </div>
      </div>

      {/* Extra Hours Section */}
      <div className="mt-4 sm:mt-6 lg:mt-8">
        <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 text-indigo-600" />
          <span className="text-xs sm:text-sm lg:text-base">Extra Hours (Overtime)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {/* Total Extra Hours */}
          <div className="bg-indigo-50 rounded-lg p-3 sm:p-4 lg:p-5">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-indigo-600" />
              <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-indigo-800">{statistics.totalExtraHours.toFixed(1)}h</span>
            </div>
            <div className="text-xs sm:text-sm lg:text-base text-indigo-600">Total Extra Hours</div>
          </div>

          {/* This Week Extra */}
          <div className="bg-indigo-50 rounded-lg p-3 sm:p-4 lg:p-5">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-indigo-600" />
              <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-indigo-800">{statistics.weekExtraHours.toFixed(1)}h</span>
            </div>
            <div className="text-xs sm:text-sm lg:text-base text-indigo-600">This Week Extra</div>
          </div>

          {/* This Month Extra */}
          <div className="bg-indigo-50 rounded-lg p-3 sm:p-4 lg:p-5">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-indigo-600" />
              <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-indigo-800">{statistics.monthExtraHours.toFixed(1)}h</span>
            </div>
            <div className="text-xs sm:text-sm lg:text-base text-indigo-600">This Month Extra</div>
          </div>

          {/* Overtime Days */}
          <div className="bg-indigo-50 rounded-lg p-3 sm:p-4 lg:p-5">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-indigo-600" />
              <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-indigo-800">{statistics.overtimeDays}</span>
            </div>
            <div className="text-xs sm:text-sm lg:text-base text-indigo-600">Overtime Days</div>
          </div>
        </div>
      </div>

      {/* Regular Hours Breakdown */}
      <div className="mt-4 sm:mt-6 lg:mt-8">
        <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 text-blue-600" />
          <span className="text-xs sm:text-sm lg:text-base">Regular Hours Breakdown</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {/* Total Regular Hours */}
          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 lg:p-5">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
              <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-blue-800">{statistics.totalRegularHours.toFixed(1)}h</span>
            </div>
            <div className="text-xs sm:text-sm lg:text-base text-blue-600">Total Regular Hours</div>
          </div>

          {/* This Week Regular */}
          <div className="bg-green-50 rounded-lg p-3 sm:p-4 lg:p-5">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
              <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-green-800">{statistics.weekRegularHours.toFixed(1)}h</span>
            </div>
            <div className="text-xs sm:text-sm lg:text-base text-green-600">This Week Regular</div>
          </div>

          {/* This Month Regular */}
          <div className="bg-purple-50 rounded-lg p-3 sm:p-4 lg:p-5">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" />
              <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-purple-800">{statistics.monthRegularHours.toFixed(1)}h</span>
            </div>
            <div className="text-xs sm:text-sm lg:text-base text-purple-600">This Month Regular</div>
          </div>
        </div>
      </div>

      {/* Today's Progress - Find today's record */}
      {(() => {
        const today = new Date().toLocaleDateString('en-CA');
        const todayRecord = records.find(record => record.date === today);
        
        if (todayRecord && todayRecord.totalWorkingHours > 0) {
          const isOverMaxHours = todayRecord.totalWorkingHours > maxWorkingHours;
          const progressPercentage = getProgressPercentage(todayRecord.totalWorkingHours);
          
          return (
            <div className="mt-4 sm:mt-6 lg:mt-8 p-3 sm:p-4 lg:p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-xs sm:text-sm lg:text-base font-medium text-gray-700">Today's Progress</span>
                <span className="text-xs sm:text-sm lg:text-base text-gray-600">
                  {todayRecord.totalWorkingHours.toFixed(1)}h / {maxWorkingHours}h
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 lg:h-4">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isOverMaxHours 
                      ? 'bg-gradient-to-r from-red-500 to-red-600' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  }`}
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-1 sm:mt-2">
                <div className="text-xs sm:text-sm lg:text-base text-gray-500">
                  {progressPercentage.toFixed(0)}% of daily target
                </div>
                {isOverMaxHours && (
                  <div className="flex items-center text-xs sm:text-sm lg:text-base text-red-600">
                    <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span>Overtime</span>
                  </div>
                )}
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Warning Modal for Max Hours */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8 max-w-lg w-full">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 mr-3" />
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">Maximum Hours Reached</h3>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-4">
              You've reached the maximum working hours ({maxWorkingHours}h). Would you like to continue working and track extra hours?
            </p>
            
            {/* Extra Time Reason Input */}
            <div className="mb-6">
              <label className="block text-sm sm:text-base lg:text-lg font-medium text-gray-700 mb-2">
                Reason for Extra Time (Required)
              </label>
              <textarea
                value={extraTimeReason}
                onChange={(e) => setExtraTimeReason(e.target.value)}
                placeholder="Please provide a reason for working extra time..."
                className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base lg:text-lg resize-none"
                rows={3}
                required
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={handleContinueWorking}
                className="flex-1 bg-blue-600 text-white px-4 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base lg:text-lg font-medium"
              >
                Continue Working
              </button>
              <button
                onClick={handleClockOut}
                className="flex-1 bg-gray-600 text-white px-4 py-2 sm:py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm sm:text-base lg:text-lg font-medium"
              >
                Clock Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
