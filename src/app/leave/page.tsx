'use client';

import AppLayout from '@/components/AppLayout';
import { Calendar, Clock, FileText, Send, AlertCircle, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

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
  const [leaveType, setLeaveType] = useState('sick');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    fetchMyRequests();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        // Refresh requests list
        fetchMyRequests();
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
      <div className="container mx-auto px-4 py-8">
              {/* Header */}
              <div className="text-center mb-8" id="leave">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Leave Request</h1>
                <p className="text-gray-600 text-lg">Submit your leave and work from home requests</p>
              </div>

              {/* Main Content */}
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Leave Type */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Leave Type
                      </label>
                                  <select
                                    value={leaveType}
                                    onChange={(e) => setLeaveType(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black bg-white"
                                    required
                                  >
                        <option value="sick">Sick Leave</option>
                        <option value="vacation">Vacation Leave</option>
                        <option value="personal">Personal Leave</option>
                        <option value="work-from-home">Work from Home</option>
                        <option value="emergency">Emergency Leave</option>
                      </select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Start Date
                        </label>
                                    <input
                                      type="date"
                                      value={startDate}
                                      onChange={(e) => setStartDate(e.target.value)}
                                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black bg-white"
                                      required
                                    />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          End Date
                        </label>
                                    <input
                                      type="date"
                                      value={endDate}
                                      onChange={(e) => setEndDate(e.target.value)}
                                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black bg-white"
                                      required
                                    />
                      </div>
                    </div>

                    {/* Reason */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Reason
                      </label>
                                  <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black bg-white"
                                    placeholder="Please provide a detailed reason for your leave request..."
                                    required
                                  />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center px-6 py-4 bg-purple-600 text-white rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-6 h-6 mr-3" />
                          Submit Request
                        </>
                      )}
                    </button>
                  </form>
                </div>

                            {/* My Requests */}
                            <div className="mt-8">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">My Leave Requests</h3>
                                <button
                                  onClick={fetchMyRequests}
                                  disabled={loadingRequests}
                                  className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingRequests ? 'animate-spin' : ''}`} />
                                  Refresh
                                </button>
                              </div>
                              
                              {loadingRequests ? (
                                <div className="flex items-center justify-center py-8">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
                                  <span className="text-gray-600">Loading requests...</span>
                                </div>
                              ) : myRequests.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 bg-white rounded-lg">
                                  No leave requests found
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {myRequests.map((request) => (
                                    <div key={request._id} className="bg-white rounded-lg p-4 shadow-lg">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                          <span className="font-semibold text-gray-800">
                                            {request.leaveType.replace('-', ' ').toUpperCase()}
                                          </span>
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                          }`}>
                                            {request.status.toUpperCase()}
                                          </span>
                                        </div>
                                        <span className="text-sm text-gray-600">
                                          {new Date(request.submittedAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <div className="text-sm text-gray-600 mb-2">
                                        {request.startDate} to {request.endDate}
                                      </div>
                                      <div className="text-sm text-gray-700">
                                        {request.reason}
                                      </div>
                                      {request.managerComments && (
                                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                                          <strong>Manager Comments:</strong> {request.managerComments}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Quick Info */}
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="bg-white rounded-lg p-6 shadow-lg">
                                <div className="flex items-center mb-3">
                                  <Calendar className="w-6 h-6 text-blue-600 mr-2" />
                                  <h3 className="font-semibold text-black">Leave Balance</h3>
                                </div>
                                <p className="text-2xl font-bold text-blue-600">15 days</p>
                                <p className="text-sm text-black">Remaining this year</p>
                              </div>

                              <div className="bg-white rounded-lg p-6 shadow-lg">
                                <div className="flex items-center mb-3">
                                  <Clock className="w-6 h-6 text-green-600 mr-2" />
                                  <h3 className="font-semibold text-black">Pending Requests</h3>
                                </div>
                                <p className="text-2xl font-bold text-green-600">
                                  {myRequests.filter(r => r.status === 'pending').length}
                                </p>
                                <p className="text-sm text-black">Awaiting approval</p>
                              </div>

                              <div className="bg-white rounded-lg p-6 shadow-lg">
                                <div className="flex items-center mb-3">
                                  <FileText className="w-6 h-6 text-orange-600 mr-2" />
                                  <h3 className="font-semibold text-black">This Month</h3>
                                </div>
                                <p className="text-2xl font-bold text-orange-600">
                                  {myRequests.filter(r => r.status === 'approved').length}
                                </p>
                                <p className="text-sm text-black">Approved requests</p>
                              </div>
                            </div>
              </div>
      </div>
    </AppLayout>
  );
}
