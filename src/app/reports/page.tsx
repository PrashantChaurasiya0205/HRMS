'use client';

import AppLayout from '@/components/AppLayout';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Download, 
  Calendar, 
  Clock, 
  User, 
  TrendingUp, 
  RefreshCw,
  Search
} from 'lucide-react';

interface Employee {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
  position?: string;
  hireDate?: string;
}


interface LeaveRecord {
  _id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
}

interface EmployeeReport {
  employee: Employee;
  attendance: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    attendancePercentage: number;
    totalHours: number;
    overtimeHours: number;
    averageDailyHours: number;
  };
  leave: {
    balance: {
      sick: number;
      vacation: number;
      personal: number;
      workFromHome: number;
      emergency: number;
    };
    taken: LeaveRecord[];
    pending: LeaveRecord[];
  };
  performance: {
    punctualityScore: number;
    attendanceTrend: 'improving' | 'declining' | 'stable';
    lastMonthAttendance: number;
  };
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [report, setReport] = useState<EmployeeReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (session) {
      const userRole = (session.user?.role || '').toLowerCase();
      const isManager = ['manager', 'ceo', 'co-founder', 'cfo'].includes(userRole);
      
      if (isManager) {
        fetchEmployees();
      } else {
        // For regular employees, set themselves as selected employee
        setSelectedEmployee(session.user?.email || '');
        fetchEmployeeData();
      }
    }
  }, [session, status, router]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/admin');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchEmployeeData = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setEmployees([data]);
        // Auto-generate report for employee
        setTimeout(() => {
          generateReport();
        }, 100);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  };

  const generateReport = async () => {
    const userRole = (session?.user?.role || '').toLowerCase();
    const isManager = ['manager', 'ceo', 'co-founder', 'cfo'].includes(userRole);
    
    if (isManager && !selectedEmployee) return;
    
    try {
      setLoading(true);
      
      let response;
      if (isManager) {
        response = await fetch(`/api/reports/employee/${selectedEmployee}?start=${dateRange.start}&end=${dateRange.end}`);
      } else {
        response = await fetch(`/api/reports/employee/${session?.user?.email}?start=${dateRange.start}&end=${dateRange.end}`);
      }
      
      if (response.ok) {
        const data = await response.json();
        setReport(data);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format: 'pdf' | 'excel') => {
    if (!report) return;
    
    // Implementation for export functionality
    console.log(`Exporting report as ${format}`);
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
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center mb-3 sm:mb-4">
              <FileText className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600 mr-2 sm:mr-3" />
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Employee Reports</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Generate comprehensive employee reports</p>
              </div>
            </div>
          </div>

          {/* Report Controls */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <div className={`grid grid-cols-1 gap-4 mb-4 ${['manager', 'ceo', 'co-founder', 'cfo'].includes((session?.user?.role || '').toLowerCase()) ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
              {['manager', 'ceo', 'co-founder', 'cfo'].includes((session?.user?.role || '').toLowerCase()) && (
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Select Employee</label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  >
                    <option value="">Choose an employee...</option>
                    {employees.map(employee => (
                      <option key={employee._id} value={employee._id}>
                        {employee.firstName} {employee.lastName} ({employee.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={generateReport}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Generate Report
                </button>
              </div>
            </div>
          </div>

          {/* Report Content */}
          {report && (
            <div className="space-y-6">
              {/* Employee Info Header */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {report.employee.firstName} {report.employee.lastName}
                      </h2>
                      <p className="text-gray-600">{report.employee.email}</p>
                      <p className="text-sm text-gray-500">
                        {report.employee.role} • {report.employee.department || 'No Department'}
                      </p>
                    </div>
                  </div>
                  {['manager', 'ceo', 'co-founder', 'cfo'].includes((session?.user?.role || '').toLowerCase()) && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => exportReport('pdf')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </button>
                      <button
                        onClick={() => exportReport('excel')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Excel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Attendance Summary */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center mb-4">
                  <Clock className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Attendance Summary</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{report.attendance.presentDays}</div>
                    <div className="text-sm text-gray-600">Present Days</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{report.attendance.absentDays}</div>
                    <div className="text-sm text-gray-600">Absent Days</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{report.attendance.lateDays}</div>
                    <div className="text-sm text-gray-600">Late Days</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{report.attendance.attendancePercentage}%</div>
                    <div className="text-sm text-gray-600">Attendance Rate</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-xl font-semibold text-gray-900">{report.attendance.totalHours.toFixed(1)}h</div>
                    <div className="text-sm text-gray-600">Total Hours</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-xl font-semibold text-orange-600">{report.attendance.overtimeHours.toFixed(1)}h</div>
                    <div className="text-sm text-gray-600">Overtime Hours</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-xl font-semibold text-purple-600">{report.attendance.averageDailyHours.toFixed(1)}h</div>
                    <div className="text-sm text-gray-600">Avg Daily Hours</div>
                  </div>
                </div>
              </div>

              {/* Leave Management */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center mb-4">
                  <Calendar className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Leave Management</h3>
                </div>
                
                {/* Leave Balance */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Leave Balance</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-lg font-semibold text-red-600">{report.leave.balance.sick}</div>
                      <div className="text-xs text-gray-600">Sick Leave</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-semibold text-blue-600">{report.leave.balance.vacation}</div>
                      <div className="text-xs text-gray-600">Vacation</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-semibold text-purple-600">{report.leave.balance.personal}</div>
                      <div className="text-xs text-gray-600">Personal</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-semibold text-green-600">{report.leave.balance.workFromHome}</div>
                      <div className="text-xs text-gray-600">WFH</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-lg font-semibold text-orange-600">{report.leave.balance.emergency}</div>
                      <div className="text-xs text-gray-600">Emergency</div>
                    </div>
                  </div>
                </div>

                {/* Leave History */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Recent Leave Requests</h4>
                    <div className="space-y-2">
                      {report.leave.taken.slice(0, 5).map(leave => (
                        <div key={leave._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{leave.type}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                            leave.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {leave.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Pending Requests</h4>
                    <div className="space-y-2">
                      {report.leave.pending.map(leave => (
                        <div key={leave._id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{leave.type}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            Pending
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{report.performance.punctualityScore}%</div>
                    <div className="text-sm text-gray-600">Punctuality Score</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{report.performance.lastMonthAttendance}%</div>
                    <div className="text-sm text-gray-600">Last Month Attendance</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 capitalize">{report.performance.attendanceTrend}</div>
                    <div className="text-sm text-gray-600">Attendance Trend</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Report State */}
          {!report && !loading && (
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Report Generated</h3>
              <p className="text-gray-600">Select an employee and date range to generate a comprehensive report.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}