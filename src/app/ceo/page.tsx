'use client';

import AppLayout from '@/components/AppLayout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Save, RefreshCw, Shield, Users } from 'lucide-react';

interface Employee {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function CEOPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState('');

  const roles = ['employee', 'intern', 'hr', 'manager', 'co-founder', 'ceo'];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Check if user is CEO
        const userRole = (parsedUser.role || '').toLowerCase();
        if (userRole !== 'ceo') {
          router.push('/access-denied');
          return;
        }
        
        setLoading(false);
        fetchEmployees();
      } catch (error) {
        console.error('Error parsing user data:', error);
        setLoading(false);
        router.push('/login');
      }
    } else {
      setLoading(false);
      router.push('/login');
    }
  }, [router]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (employeeId: string, role: string) => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateUserRole',
          employeeId,
          role
        })
      });

      if (response.ok) {
        alert('User role updated successfully!');
        setEditingId(null);
        fetchEmployees();
      } else {
        alert('Error updating user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Error updating user role');
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
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center mb-3 sm:mb-4">
              <Shield className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-600 mr-2 sm:mr-3" />
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">CEO Dashboard</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Manage user roles and permissions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2 sm:mr-3" />
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">User Management</h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">{employees.length} users</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm lg:text-base">User</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm lg:text-base">Current Role</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm lg:text-base">New Role</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm lg:text-base">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 sm:py-4 px-2 sm:px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 text-sm sm:text-base truncate">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 truncate">{employee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4">
                        <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                          employee.role === 'ceo' ? 'bg-purple-100 text-purple-800' :
                          employee.role === 'co-founder' ? 'bg-indigo-100 text-indigo-800' :
                          employee.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                          employee.role === 'hr' ? 'bg-green-100 text-green-800' :
                          employee.role === 'intern' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {employee.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4">
                        {editingId === employee._id ? (
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="w-full sm:w-auto px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-xs sm:text-sm"
                          >
                            {roles.map(role => (
                              <option key={role} value={role}>
                                {role.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-500 text-xs sm:text-sm">Click Edit to change</span>
                        )}
                      </td>
                      <td className="text-center py-3 sm:py-4 px-2 sm:px-4">
                        {editingId === employee._id ? (
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-center">
                            <button
                              onClick={() => handleRoleUpdate(employee._id, newRole)}
                              disabled={saving}
                              className="px-2 sm:px-3 py-1 sm:py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs sm:text-sm"
                            >
                              {saving ? (
                                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mr-1" />
                              ) : (
                                <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              )}
                              <span className="hidden sm:inline">Save</span>
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setNewRole('');
                              }}
                              className="px-2 sm:px-3 py-1 sm:py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-xs sm:text-sm"
                            >
                              <span className="hidden sm:inline">Cancel</span>
                              <span className="sm:hidden">×</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(employee._id);
                              setNewRole(employee.role);
                            }}
                            className="px-2 sm:px-3 py-1 sm:py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm"
                          >
                            <span className="hidden sm:inline">Edit Role</span>
                            <span className="sm:hidden">Edit</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
