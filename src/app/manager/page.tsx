'use client';

import AppLayout from '@/components/AppLayout';
import { Calendar, Clock, User, CheckCircle, XCircle, MessageSquare, Filter, Shield, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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

export default function ManagerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [managerComments, setManagerComments] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if user is manager
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    // Fallback check for unauthorized access
    if (status === 'authenticated' && session && !['manager', 'CEO', 'Co-founder'].includes(session.user?.role || '')) {
      router.push(`/access-denied?redirect=${window.location.pathname}`);
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    // Only fetch requests if user has proper role
    if (session && ['manager', 'CEO', 'Co-founder'].includes(session.user?.role || '')) {
      fetchRequests();
    }
  }, [session]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leave/all');
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        console.error('Failed to fetch leave requests');
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (status === 'loading') {
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

  const handleApprove = async (requestId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/leave/approve', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          status: 'approved',
          managerComments: managerComments || undefined,
        }),
      });

      if (response.ok) {
        alert('Leave request approved successfully!');
        setSelectedRequest(null);
        setManagerComments('');
        fetchRequests();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to approve leave request');
      }
    } catch (error) {
      console.error('Error approving leave request:', error);
      alert('Failed to approve leave request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (requestId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/leave/approve', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          status: 'rejected',
          managerComments: managerComments || undefined,
        }),
      });

      if (response.ok) {
        alert('Leave request rejected successfully!');
        setSelectedRequest(null);
        setManagerComments('');
        fetchRequests();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to reject leave request');
      }
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      alert('Failed to reject leave request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this leave request? This action cannot be undone.')) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/leave/requests', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId }),
      });

      if (response.ok) {
        alert('Leave request deleted successfully!');
        fetchRequests();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete leave request');
      }
    } catch (error) {
      console.error('Error deleting leave request:', error);
      alert('Failed to delete leave request');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      'approved': { color: 'bg-green-100 text-green-800', text: 'Approved' },
      'rejected': { color: 'bg-red-100 text-red-800', text: 'Rejected' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-100 text-gray-800', text: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getLeaveTypeColor = (type: string) => {
    const typeConfig = {
      'sick': 'text-black bg-red-50 border-red-200',
      'vacation': 'text-black bg-blue-50 border-blue-200',
      'personal': 'text-black bg-purple-50 border-purple-200',
      'work-from-home': 'text-black bg-green-50 border-green-200',
      'emergency': 'text-black bg-orange-50 border-orange-200',
    };
    
    return typeConfig[type as keyof typeof typeConfig] || 'text-black bg-gray-50 border-gray-200';
  };


  // Show access denied if not authenticated or not manager
  if (status === 'unauthenticated') {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h1>
            <p className="text-gray-600 mb-6">Please log in to access this page.</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }


  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
              {/* Header */}
              <div className="text-center mb-8" id="manager">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Manager Dashboard</h1>
                <p className="text-gray-600 text-lg">Review and approve leave requests</p>
              </div>

              {/* Filter */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Filter:</span>
                  </div>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black bg-white w-full sm:w-auto"
                  >
                    <option value="all">All Requests</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Requests List */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Leave Requests</h3>
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
                    <span className="text-gray-600">Loading requests...</span>
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No leave requests found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRequests.map((request) => (
                      <div key={request._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <div className="flex items-center gap-2">
                              <User className="w-5 h-5 text-gray-600" />
                              <span className="font-semibold text-gray-800">{request.employeeName}</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getLeaveTypeColor(request.leaveType)} w-fit`}>
                              {request.leaveType.replace('-', ' ').toUpperCase()}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            {getStatusBadge(request.status)}
                            <div className="flex gap-2">
                              {request.status === 'pending' && (
                                <button
                                  onClick={() => setSelectedRequest(request)}
                                  className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
                                >
                                  Review
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(request._id)}
                                disabled={isProcessing}
                                className="p-2 bg-transparent text-black rounded-lg hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{request.startDate} to {request.endDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Submitted: {new Date(request.submittedAt).toLocaleDateString()}</span>
                          </div>
                          {request.reviewedAt && (
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              <span>Reviewed: {new Date(request.reviewedAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-sm text-gray-700">
                            <strong>Reason:</strong> {request.reason}
                          </p>
                          {request.managerComments && (
                            <p className="text-sm text-gray-700 mt-1">
                              <strong>Manager Comments:</strong> {request.managerComments}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
      </div>

      {/* Review Modal */}
          {selectedRequest && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Review Leave Request</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="text-black">
                    <strong>Employee:</strong> {selectedRequest.employeeName}
                  </div>
                  <div className="text-black">
                    <strong>Leave Type:</strong> {selectedRequest.leaveType.replace('-', ' ').toUpperCase()}
                  </div>
                  <div className="text-black">
                    <strong>Dates:</strong> {selectedRequest.startDate} to {selectedRequest.endDate}
                  </div>
                  <div className="text-black">
                    <strong>Reason:</strong> {selectedRequest.reason}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">
                    Manager Comments (Optional)
                  </label>
                  <textarea
                    value={managerComments}
                    onChange={(e) => setManagerComments(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black bg-white"
                    placeholder="Add comments for the employee..."
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleApprove(selectedRequest._id)}
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(selectedRequest._id)}
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                </div>
                
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setManagerComments('');
                  }}
                  className="w-full mt-3 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
    </AppLayout>
  );
}
