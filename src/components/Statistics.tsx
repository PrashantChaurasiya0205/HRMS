'use client';

import React, { useMemo } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { TrendingUp, Calendar, Clock, Target } from 'lucide-react';
import { useAttendance } from '@/context/AttendanceContext';

export default function Statistics() {
  const { state } = useAttendance();

  const statistics = useMemo(() => {
    const now = new Date();
    const startOfThisWeek = startOfWeek(now);
    const endOfThisWeek = endOfWeek(now);
    const startOfThisMonth = startOfMonth(now);
    const endOfThisMonth = endOfMonth(now);

    // Filter records for this week and month
    const thisWeekRecords = state.records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startOfThisWeek && recordDate <= endOfThisWeek;
    });

    const thisMonthRecords = state.records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startOfThisMonth && recordDate <= endOfThisMonth;
    });

    // Calculate totals
    const totalHours = state.records.reduce((sum, record) => sum + record.totalWorkingHours, 0);
    const weekHours = thisWeekRecords.reduce((sum, record) => sum + record.totalWorkingHours, 0);
    const monthHours = thisMonthRecords.reduce((sum, record) => sum + record.totalWorkingHours, 0);

    // Calculate averages
    const avgDailyHours = state.records.length > 0 ? totalHours / state.records.length : 0;
    const avgWeekHours = thisWeekRecords.length > 0 ? weekHours / thisWeekRecords.length : 0;

    // Calculate working days
    const workingDays = state.records.filter(record => record.totalWorkingHours > 0).length;

    return {
      totalHours,
      weekHours,
      monthHours,
      avgDailyHours,
      avgWeekHours,
      workingDays,
      totalRecords: state.records.length,
    };
  }, [state.records]);

  const getProgressPercentage = (current: number, target: number = 8) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
        Statistics
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Hours */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold text-blue-800">{statistics.totalHours.toFixed(1)}h</span>
          </div>
          <div className="text-sm text-blue-600">Total Hours</div>
        </div>

        {/* This Week */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold text-green-800">{statistics.weekHours.toFixed(1)}h</span>
          </div>
          <div className="text-sm text-green-600">This Week</div>
        </div>

        {/* This Month */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-purple-600" />
            <span className="text-2xl font-bold text-purple-800">{statistics.monthHours.toFixed(1)}h</span>
          </div>
          <div className="text-sm text-purple-600">This Month</div>
        </div>

        {/* Average Daily */}
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <span className="text-2xl font-bold text-orange-800">{statistics.avgDailyHours.toFixed(1)}h</span>
          </div>
          <div className="text-sm text-orange-600">Avg Daily</div>
        </div>

        {/* Working Days */}
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span className="text-2xl font-bold text-indigo-800">{statistics.workingDays}</span>
          </div>
          <div className="text-sm text-indigo-600">Working Days</div>
        </div>

        {/* Total Records */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <span className="text-2xl font-bold text-gray-800">{statistics.totalRecords}</span>
          </div>
          <div className="text-sm text-gray-600">Total Records</div>
        </div>
      </div>

      {/* Progress Bar for Today's Target */}
      {state.currentRecord && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Today's Progress</span>
            <span className="text-sm text-gray-600">
              {state.currentRecord.totalWorkingHours.toFixed(1)}h / 8h
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage(state.currentRecord.totalWorkingHours)}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {getProgressPercentage(state.currentRecord.totalWorkingHours).toFixed(0)}% of daily target
          </div>
        </div>
      )}
    </div>
  );
}
