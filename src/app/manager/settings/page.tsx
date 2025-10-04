'use client';

import AppLayout from '@/components/AppLayout';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Clock, Calendar, Save, RefreshCw, AlertCircle, Users, Settings2 } from 'lucide-react';

interface Employee {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  leaveBalance: {
    sick: number;
    vacation: number;
    personal: number;
    workFromHome: number;
    emergency: number;
  };
}

export default function ManagerSettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dailyHours, setDailyHours] = useState(8);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [bulkLeaveBalances, setBulkLeaveBalances] = useState({
    sick: 10,
    vacation: 20,
    personal: 5,
    workFromHome: 12,
    emergency: 3
  });
  const [bulkInputValues, setBulkInputValues] = useState({
    sick: '10',
    vacation: '20',
    personal: '5',
    workFromHome: '12',
    emergency: '3'
  });

  useEffect(() => {
    // Fallback check for unauthorized access
    if (session && !['manager', 'CEO', 'Co-founder'].includes(session.user?.role || '')) {
      router.push(`/access-denied?redirect=${window.location.pathname}`);
      return;
    }
    
    if (session && ['manager', 'CEO', 'Co-founder'].includes(session.user?.role || '')) {
      fetchEmployees();
    }
  }, [session, router]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/admin');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
        setDailyHours(data.workingHours?.dailyHours || 8);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleDailyHoursUpdate = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateWorkingHours',
          dailyHours,
          weeklyHours: dailyHours * 5,
          monthlyHours: dailyHours * 20
        })
      });

      if (response.ok) {
        alert('Daily hours updated successfully!');
      } else {
        alert('Error updating daily hours');
      }
    } catch (error) {
      console.error('Error updating daily hours:', error);
      alert('Error updating daily hours');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkLeaveUpdate = async () => {
    try {
      setSaving(true);
      
      // Convert input values to numbers, set 0 for empty strings
      const finalBalances = {
        sick: bulkInputValues.sick === '' ? 0 : parseInt(bulkInputValues.sick, 10) || 0,
        vacation: bulkInputValues.vacation === '' ? 0 : parseInt(bulkInputValues.vacation, 10) || 0,
        personal: bulkInputValues.personal === '' ? 0 : parseInt(bulkInputValues.personal, 10) || 0,
        workFromHome: bulkInputValues.workFromHome === '' ? 0 : parseInt(bulkInputValues.workFromHome, 10) || 0,
        emergency: bulkInputValues.emergency === '' ? 0 : parseInt(bulkInputValues.emergency, 10) || 0
      };
      
      // Update all employees with the same leave balances
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulkUpdateLeaveBalances',
          employees: employees.map(emp => emp._id),
          leaveBalances: finalBalances
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update leave balances');
      }
      
      // Refresh employee data
      await fetchEmployees();
      setShowBulkUpdate(false);
      alert('Leave balances updated for all employees successfully!');
      
    } catch (error) {
      console.error('Error updating leave balances:', error);
      alert('Error updating leave balances');
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex items-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mr-3" />
            <span className="text-lg text-gray-700">Loading settings...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Settings2 className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
                <p className="text-gray-600 mt-1">Manage working hours and employee leave balances</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Daily Hours Configuration */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <Clock className="w-6 h-6 text-blue-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Working Hours</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Working Hours
                    </label>
                    <input
                      type="number"
                      value={dailyHours}
                      onChange={(e) => setDailyHours(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      min="1"
                      max="24"
                      placeholder="Enter daily hours"
                    />
                    <p className="text-xs text-gray-500 mt-1">Standard working hours per day</p>
                  </div>
                  
                  <button
                    onClick={handleDailyHoursUpdate}
                    disabled={saving}
                    className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? (
                      <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Save className="w-5 h-5 mr-2" />
                    )}
                    Update Daily Hours
                  </button>
                </div>
              </div>
            </div>

            {/* Employee Leave Management */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Users className="w-6 h-6 text-green-600 mr-3" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Employee Leave Balances</h2>
                      <p className="text-sm text-gray-600 mt-1">{employees.length} employees</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowBulkUpdate(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Bulk Update
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/admin', { 
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'fixLeaveBalances' })
                          });
                          if (response.ok) {
                            const data = await response.json();
                            alert(`Fixed leave balances for ${data.updatedCount} users`);
                            fetchEmployees();
                          } else {
                            alert('Error fixing leave balances');
                          }
                        } catch (error) {
                          alert('Error fixing leave balances');
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Fix Balances
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Employee</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700">Sick</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700">Vacation</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700">Personal</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700">WFH</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700">Emergency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((employee) => (
                        <tr key={employee._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <User className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {employee.firstName} {employee.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{employee.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-4 px-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              (employee.leaveBalance?.sick || 0) === 0 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {employee.leaveBalance?.sick || 0}
                            </span>
                          </td>
                          <td className="text-center py-4 px-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              (employee.leaveBalance?.vacation || 0) === 0 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {employee.leaveBalance?.vacation || 0}
                            </span>
                          </td>
                          <td className="text-center py-4 px-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              (employee.leaveBalance?.personal || 0) === 0 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {employee.leaveBalance?.personal || 0}
                            </span>
                          </td>
                          <td className="text-center py-4 px-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              (employee.leaveBalance?.workFromHome || 0) === 0 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {employee.leaveBalance?.workFromHome || 0}
                            </span>
                          </td>
                          <td className="text-center py-4 px-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              (employee.leaveBalance?.emergency || 0) === 0 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {employee.leaveBalance?.emergency || 0}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Update Modal */}
        {showBulkUpdate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center mb-6">
                <Calendar className="w-6 h-6 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Bulk Update Leave Balances</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sick Leave</label>
                  <input
                    type="number"
                    value={bulkInputValues.sick}
                    onChange={(e) => {
                      setBulkInputValues({...bulkInputValues, sick: e.target.value});
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                    min="0"
                    step="1"
                    placeholder="Enter number or leave blank for 0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vacation Leave</label>
                  <input
                    type="number"
                    value={bulkInputValues.vacation}
                    onChange={(e) => {
                      setBulkInputValues({...bulkInputValues, vacation: e.target.value});
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                    min="0"
                    step="1"
                    placeholder="Enter number or leave blank for 0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Personal Leave</label>
                  <input
                    type="number"
                    value={bulkInputValues.personal}
                    onChange={(e) => {
                      setBulkInputValues({...bulkInputValues, personal: e.target.value});
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                    min="0"
                    step="1"
                    placeholder="Enter number or leave blank for 0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Work from Home</label>
                  <input
                    type="number"
                    value={bulkInputValues.workFromHome}
                    onChange={(e) => {
                      setBulkInputValues({...bulkInputValues, workFromHome: e.target.value});
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                    min="0"
                    step="1"
                    placeholder="Enter number or leave blank for 0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Leave</label>
                  <input
                    type="number"
                    value={bulkInputValues.emergency}
                    onChange={(e) => {
                      setBulkInputValues({...bulkInputValues, emergency: e.target.value});
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                    min="0"
                    step="1"
                    placeholder="Enter number or leave blank for 0"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleBulkLeaveUpdate}
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {saving ? (
                    <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Save className="w-5 h-5 mr-2" />
                  )}
                  Update All Employees
                </button>
                <button
                  onClick={() => setShowBulkUpdate(false)}
                  className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}