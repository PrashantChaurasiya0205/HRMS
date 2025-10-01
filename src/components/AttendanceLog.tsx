'use client';

import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Search, Filter, Download, Calendar, Clock, Coffee } from 'lucide-react';
import { useAttendance } from '@/context/AttendanceContext';
import { exportRecordsToCSV } from '@/utils/storage';

export default function AttendanceLog() {
  const { state } = useAttendance();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredRecords = useMemo(() => {
    let filtered = state.records;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.id.includes(searchTerm)
      );
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(record => record.date === dateFilter);
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.records, searchTerm, dateFilter, statusFilter]);

  const handleExportCSV = () => {
    const csvContent = exportRecordsToCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'WORKING': { color: 'bg-green-100 text-green-800', text: 'Working' },
      'LUNCH_BREAK': { color: 'bg-orange-100 text-orange-800', text: 'Lunch' },
      'CLOCKED_OUT': { color: 'bg-red-100 text-red-800', text: 'Completed' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-100 text-gray-800', text: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 sm:mb-0">Attendance Log</h3>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Status</option>
          <option value="WORKING">Working</option>
          <option value="LUNCH_BREAK">Lunch Break</option>
          <option value="CLOCKED_OUT">Completed</option>
        </select>
      </div>

      {/* Records Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Clock In</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Clock Out</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Lunch</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Hours</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No attendance records found
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800">
                    {format(new Date(record.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-blue-500" />
                      {format(record.clockIn, 'HH:mm:ss')}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {record.clockOut ? (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-red-500" />
                        {format(record.clockOut, 'HH:mm:ss')}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {record.lunchStart && record.lunchEnd ? (
                      <div className="flex items-center">
                        <Coffee className="w-4 h-4 mr-2 text-orange-500" />
                        <div className="text-sm">
                          <div>{format(record.lunchStart, 'HH:mm')} - {format(record.lunchEnd, 'HH:mm')}</div>
                          <div className="text-xs text-gray-500">{record.lunchDuration} min</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-800 font-semibold">
                    {record.totalWorkingHours.toFixed(2)}h
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(record.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {filteredRecords.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-800">{filteredRecords.length}</div>
              <div className="text-sm text-blue-600">Total Records</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-800">
                {filteredRecords.reduce((sum, record) => sum + record.totalWorkingHours, 0).toFixed(1)}h
              </div>
              <div className="text-sm text-blue-600">Total Hours</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-800">
                {(filteredRecords.reduce((sum, record) => sum + record.totalWorkingHours, 0) / filteredRecords.length).toFixed(1)}h
              </div>
              <div className="text-sm text-blue-600">Average per Day</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
