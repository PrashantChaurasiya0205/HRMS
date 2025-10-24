'use client';

import AppLayout from '@/components/AppLayout';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Clock, Coffee, CheckCircle, AlertCircle, RefreshCw, User, Calendar } from 'lucide-react';

interface EmployeeStatus {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: 'working' | 'lunch' | 'completed' | 'offline';
  clockInTime?: string;
  clockOutTime?: string;
  lunchStartTime?: string;
  lunchEndTime?: string;
  totalWorkingHours?: number;
  isCheckedIn: boolean;
  isOnLunch: boolean;
}

export default function ManagerStatusPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (session) {
      const userRole = (session.user?.role || '').toLowerCase();
      const allowedRoles = ['manager', 'ceo', 'co-founder', 'cfo'];
      if (!allowedRoles.includes(userRole)) {
        router.push('/access-denied');
        return;
      }
      fetchEmployeeStatus();
    }
  }, [session, status, router]);

  const fetchEmployeeStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/attendance/status');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error('Error fetching employee status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEmployeeStatus();
    setRefreshing(false);
  };

  const getStatusIcon = (employee: EmployeeStatus) => {
    if (employee.isOnLunch) {
      return <Coffee className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />;
    } else if (employee.isCheckedIn) {
      return <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />;
    } else if (employee.status === 'completed') {
      return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />;
    } else {
      return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />;
    }
  };

  const getStatusText = (employee: EmployeeStatus) => {
    if (employee.status === 'completed') {
      return 'Clocked Out';
    } else if (employee.isOnLunch) {
      return 'On Lunch';
    } else if (employee.isCheckedIn) {
      return 'Working';
    } else {
      return 'Offline';
    }
  };

  const getStatusColor = (employee: EmployeeStatus) => {
    if (employee.status === 'completed') {
      return 'bg-blue-100 text-blue-800';
    } else if (employee.isOnLunch) {
      return 'bg-orange-100 text-orange-800';
    } else if (employee.isCheckedIn) {
      return 'bg-green-100 text-green-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'N/A';
    // Since times are stored in local timezone, just format them directly
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatHours = (hours?: number) => {
    if (!hours) return '0h 0m';
    const h = Math.floor(hours);
    const m = Math.floor((hours % 1) * 60);
    return `${h}h ${m}m`;
  };

  if (status === 'loading') {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex items-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mr-3" />
            <span className="text-lg text-gray-700">Loading...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-3 sm:gap-4">
              <div className="flex items-center min-w-0">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 break-words">Employee Status</h1>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">Real-time status of all employees</p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto"
              >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {employees.map((employee) => (
              <div key={employee._id} className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 text-sm sm:text-base break-words">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 break-all">{employee.email}</div>
                      <div className="text-xs text-gray-400 capitalize">{employee.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center flex-shrink-0 ml-2">
                    {getStatusIcon(employee)}
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Status:</span>
                    <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(employee)} flex-shrink-0`}>
                      {getStatusText(employee)}
                    </span>
                  </div>

                  {employee.isCheckedIn && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Clock In:</span>
                        <span className="text-xs sm:text-sm text-gray-900 text-right break-words">{formatTime(employee.clockInTime)}</span>
                      </div>
                      
                      {employee.lunchStartTime && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Lunch Start:</span>
                          <span className="text-xs sm:text-sm text-gray-900 text-right break-words">{formatTime(employee.lunchStartTime)}</span>
                        </div>
                      )}
                      
                      {employee.lunchEndTime && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Lunch End:</span>
                          <span className="text-xs sm:text-sm text-gray-900 text-right break-words">{formatTime(employee.lunchEndTime)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Hours Today:</span>
                        <span className="text-xs sm:text-sm text-gray-900 font-medium text-right break-words">{formatHours(employee.totalWorkingHours)}</span>
                      </div>
                    </>
                  )}

                  {employee.status === 'completed' && employee.clockOutTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Clock Out:</span>
                      <span className="text-xs sm:text-sm text-gray-900 text-right break-words">{formatTime(employee.clockOutTime)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {employees.length === 0 && !loading && (
            <div className="text-center py-8 sm:py-12">
              <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-sm sm:text-base text-gray-500 px-4">No employee data available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
