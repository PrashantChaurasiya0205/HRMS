'use client';

import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, Calendar as CalendarIcon } from 'lucide-react';

interface Holiday {
  _id: string;
  name: string;
  date: string;
  type: 'NATIONAL' | 'PUBLIC' | 'COMPANY' | 'RELIGIOUS';
  description?: string;
  isRecurring: boolean;
}

interface CalendarProps {
  isManager?: boolean;
}

export default function Calendar({ isManager = false }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'NATIONAL' as 'NATIONAL' | 'PUBLIC' | 'COMPANY' | 'RELIGIOUS',
    description: '',
    isRecurring: false
  });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/holidays');
      if (response.ok) {
        const data = await response.json();
        setHolidays(data);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingHoliday ? `/api/holidays/${editingHoliday._id}` : '/api/holidays';
      const method = editingHoliday ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchHolidays();
        setShowModal(false);
        setEditingHoliday(null);
        setFormData({ name: '', date: '', type: 'NATIONAL' as 'NATIONAL' | 'PUBLIC' | 'COMPANY' | 'RELIGIOUS', description: '', isRecurring: false });
      }
    } catch (error) {
      console.error('Error saving holiday:', error);
    }
  };

  const handleEdit = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      name: holiday.name,
      date: holiday.date,
      type: holiday.type,
      description: holiday.description || '',
      isRecurring: holiday.isRecurring
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this holiday?')) {
      try {
        const response = await fetch(`/api/holidays/${id}`, { method: 'DELETE' });
        if (response.ok) {
          await fetchHolidays();
        }
      } catch (error) {
        console.error('Error deleting holiday:', error);
      }
    }
  };

  const getHolidaysForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return holidays.filter(holiday => holiday.date === dateStr);
  };

  const getHolidayColor = (type: string) => {
    switch (type) {
      case 'NATIONAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'PUBLIC': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPANY': return 'bg-green-100 text-green-800 border-green-200';
      case 'RELIGIOUS': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add empty cells for days before month start
  const startDay = monthStart.getDay();
  const emptyDays = Array.from({ length: startDay }, (_, i) => null);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Loading calendar...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center">
          <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2 sm:mr-3" />
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          {isManager && (
            <button
              onClick={() => {
                setEditingHoliday(null);
                setFormData({ name: '', date: '', type: 'NATIONAL' as 'NATIONAL' | 'PUBLIC' | 'COMPANY' | 'RELIGIOUS', description: '', isRecurring: false });
                setShowModal(true);
              }}
              className="flex items-center px-2 sm:px-4 py-1 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Add Holiday</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-1 sm:p-2 text-center font-semibold text-gray-600 text-xs sm:text-sm">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="h-16 sm:h-20 lg:h-24"></div>
        ))}
        {days.map(day => {
          const dayHolidays = getHolidaysForDate(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={day.toISOString()}
              className={`h-16 sm:h-20 lg:h-24 p-1 border border-gray-200 hover:bg-gray-50 cursor-pointer ${
                isToday ? 'bg-blue-50 border-blue-300' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs sm:text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                  {format(day, 'd')}
                </span>
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                {dayHolidays.slice(0, 1).map(holiday => (
                  <div
                    key={holiday._id}
                    className={`text-xs px-1 py-0.5 rounded border ${getHolidayColor(holiday.type)} truncate`}
                    title={holiday.name}
                  >
                    {holiday.name}
                  </div>
                ))}
                {dayHolidays.length > 1 && (
                  <div className="text-xs text-gray-500">
                    +{dayHolidays.length - 1} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Holiday List */}
      <div className="mt-6 sm:mt-8">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">All Holidays</h3>
        <div className="space-y-2">
          {holidays.map(holiday => (
            <div key={holiday._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center w-full sm:w-auto">
                <div className={`px-2 py-1 rounded text-xs font-medium ${getHolidayColor(holiday.type)} mb-2 sm:mb-0`}>
                  {holiday.type}
                </div>
                <div className="ml-0 sm:ml-3 flex-1">
                  <div className="font-medium text-gray-800 text-sm sm:text-base">{holiday.name}</div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {format(new Date(holiday.date), 'MMM dd, yyyy')}
                    {holiday.description && ` - ${holiday.description}`}
                  </div>
                </div>
              </div>
              {isManager && (
                <div className="flex items-center space-x-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleEdit(holiday)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(holiday._id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal - Only show for managers */}
      {showModal && isManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
              {editingHoliday ? 'Edit Holiday' : 'Add Holiday'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'NATIONAL' | 'PUBLIC' | 'COMPANY' | 'RELIGIOUS' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                >
                  <option value="NATIONAL">National Holiday</option>
                  <option value="PUBLIC">Public Holiday</option>
                  <option value="COMPANY">Company Holiday</option>
                  <option value="RELIGIOUS">Religious Holiday</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  rows={3}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isRecurring" className="text-sm text-gray-700">
                  Recurring yearly
                </label>
              </div>
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                >
                  {editingHoliday ? 'Update' : 'Add'} Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
