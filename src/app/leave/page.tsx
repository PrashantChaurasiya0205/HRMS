'use client';

import AppLayout from '@/components/AppLayout';
import LeaveBalance from '@/components/LeaveBalance';
import { Calendar, Clock, FileText, Send, AlertCircle, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface LeaveRequest {
  _id: string;
  userId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  managerComments?: string;
}

export default function LeavePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [leaveType, setLeaveType] = useState('sick');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [leaveBalance, setLeaveBalance] = useState<any>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
        setLoading(false);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setLoading(false);
      }
    } else {
      setLoading(false);
      router.push('/login');
      return;
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchMyRequests();
      fetchLeaveBalance();
    }
  }, [user]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const fetchMyRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await fetch('/api/leave/requests');
      if (response.ok) {
        const data = await response.json();
        setMyRequests(data);
      } else {
        console.error('Failed to fetch my requests');
      }
    } catch (error) {
      console.error('Error fetching my requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      setLoadingBalance(true);
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        if (data && data.leaveBalance) {
          setLeaveBalance(data.leaveBalance);
        }
      } else {
        console.error('Failed to fetch leave balance');
      }
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if selected leave type has balance
    const selectedLeaveType = leaveType === 'work-from-home' ? 'workFromHome' : leaveType;
    if (leaveBalance && leaveBalance[selectedLeaveType] === 0) {
      alert('You cannot request this leave type as you have no balance remaining');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/leave/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leaveType,
          startDate,
          endDate,
          reason,
        }),
      });

      if (response.ok) {
        alert('Leave request submitted successfully!');
        // Reset form
        setLeaveType('sick');
        setStartDate('');
        setEndDate('');
        setReason('');
        // Refresh requests list and leave balance
        fetchMyRequests();
        fetchLeaveBalance();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit leave request');
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert('Failed to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
              {/* Header */}
              <div className="text-center mb-6 sm:mb-8" id="leave">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Leave Request</h1>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600">Submit your leave and work from home requests</p>
              </div>

              {/* Main Content */}
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* Leave Balance Component */}
                  <div className="lg:col-span-1">
                    <LeaveBalance />
                  </div>
                  
                  {/* Leave Request Form */}
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {/* Leave Type */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-black mb-2">
                        Leave Type
                      </label>
                                  <select
                                    value={leaveType}
                                    onChange={(e) => setLeaveType(e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black bg-white text-sm sm:text-base"
                                    required
                                  >
                        <option value="sick" disabled={leaveBalance?.sick === 0}>
                          Sick Leave {leaveBalance?.sick === 0 ? '(No Balance)' : ''}
                        </option>
                        <option value="vacation" disabled={leaveBalance?.vacation === 0}>
                          Vacation Leave {leaveBalance?.vacation === 0 ? '(No Balance)' : ''}
                        </option>
                        <option value="personal" disabled={leaveBalance?.personal === 0}>
                          Personal Leave {leaveBalance?.personal === 0 ? '(No Balance)' : ''}
                        </option>
                        <option value="work-from-home" disabled={leaveBalance?.workFromHome === 0}>
                          Work from Home {leaveBalance?.workFromHome === 0 ? '(No Balance)' : ''}
                        </option>
                        <option value="emergency" disabled={leaveBalance?.emergency === 0}>
                          Emergency Leave {leaveBalance?.emergency === 0 ? '(No Balance)' : ''}
                        </option>
                      </select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-black mb-2">
                          Start Date
                        </label>
                                    <input
                                      type="date"
                                      value={startDate}
                                      onChange={(e) => setStartDate(e.target.value)}
                                      min={new Date().toISOString().split('T')[0]}
                                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black bg-white text-sm sm:text-base"
                                      required
                                    />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-black mb-2">
                          End Date
                        </label>
                                    <input
                                      type="date"
                                      value={endDate}
                                      onChange={(e) => setEndDate(e.target.value)}
                                      min={startDate || new Date().toISOString().split('T')[0]}
                                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black bg-white text-sm sm:text-base"
                                      required
                                    />
                      </div>
                    </div>

                    {/* Reason */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-black mb-2">
                        Reason
                      </label>
                                  <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black bg-white text-sm sm:text-base"
                                    placeholder="Please provide a detailed reason for your leave request..."
                                    required
                                  />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 bg-purple-600 text-white rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white mr-2 sm:mr-3"></div>
                          <span className="text-sm sm:text-base">Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                          <span className="text-sm sm:text-base">Submit Request</span>
                        </>
                      )}
                    </button>
                  </form>
                    </div>
                  </div>
                </div>

                            {/* My Requests */}
                            <div className="mt-6 sm:mt-8">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800">My Leave Requests</h3>
                                <button
                                  onClick={fetchMyRequests}
                                  disabled={loadingRequests}
                                  className="flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto text-sm sm:text-base"
                                >
                                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingRequests ? 'animate-spin' : ''}`} />
                                  Refresh
                                </button>
                              </div>
                              
                              {loadingRequests ? (
                                <div className="flex items-center justify-center py-6 sm:py-8">
                                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-600 mr-2 sm:mr-3"></div>
                                  <span className="text-sm sm:text-base text-gray-600">Loading requests...</span>
                                </div>
                              ) : myRequests.length === 0 ? (
                                <div className="text-center py-6 sm:py-8 text-gray-500 bg-white rounded-lg text-sm sm:text-base">
                                  No leave requests found
                                </div>
                              ) : (
                                <div className="space-y-3 sm:space-y-4">
                                  {myRequests.map((request) => (
                                    <div key={request._id} className="bg-white rounded-lg p-3 sm:p-4 shadow-lg">
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-2">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                          <span className="font-semibold text-gray-800 text-sm sm:text-base">
                                            {request.leaveType.replace('-', ' ').toUpperCase()}
                                          </span>
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${
                                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                          }`}>
                                            {request.status.toUpperCase()}
                                          </span>
                                        </div>
                                        <span className="text-xs sm:text-sm text-gray-600">
                                          {new Date(request.submittedAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <div className="text-xs sm:text-sm text-gray-600 mb-2">
                                        {request.startDate} to {request.endDate}
                                      </div>
                                      <div className="text-xs sm:text-sm text-gray-700">
                                        {request.reason}
                                      </div>
                                      {request.managerComments && (
                                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs sm:text-sm text-gray-700">
                                          <strong>Manager Comments:</strong> {request.managerComments}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Quick Info */}
                            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-lg">
                                <div className="flex items-center mb-2 sm:mb-3">
                                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2" />
                                  <h3 className="font-semibold text-black text-sm sm:text-base">Leave Balance</h3>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-blue-600">
                                  {loadingBalance ? '...' : (leaveBalance?.vacation || 0)} days
                                </p>
                                <p className="text-xs sm:text-sm text-black">Vacation remaining</p>
                              </div>

                              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-lg">
                                <div className="flex items-center mb-2 sm:mb-3">
                                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2" />
                                  <h3 className="font-semibold text-black text-sm sm:text-base">Pending Requests</h3>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-green-600">
                                  {myRequests.filter(r => r.status === 'pending').length}
                                </p>
                                <p className="text-xs sm:text-sm text-black">Awaiting approval</p>
                              </div>

                              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-lg">
                                <div className="flex items-center mb-2 sm:mb-3">
                                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 mr-2" />
                                  <h3 className="font-semibold text-black text-sm sm:text-base">This Month</h3>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-orange-600">
                                  {myRequests.filter(r => r.status === 'approved').length}
                                </p>
                                <p className="text-xs sm:text-sm text-black">Approved requests</p>
                              </div>
                            </div>
              </div>
      </div>
    </AppLayout>
  );
}
