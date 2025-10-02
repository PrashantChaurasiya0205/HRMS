'use client';

import { AttendanceProvider } from '@/context/AttendanceContext';
import SessionProvider from '@/components/SessionProvider';
import WithAuth from '@/auth/WithAuth';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Calendar, Clock, FileText, Send, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function LeavePage() {
  const [leaveType, setLeaveType] = useState('sick');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert('Leave request submitted successfully!');
    setIsSubmitting(false);
    
    // Reset form
    setLeaveType('sick');
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  return (
    <SessionProvider>
      <WithAuth>
        <AttendanceProvider>
          <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
            <Navigation />
            
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
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
                    <p className="text-2xl font-bold text-green-600">2</p>
                    <p className="text-sm text-black">Awaiting approval</p>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-lg">
                    <div className="flex items-center mb-3">
                      <FileText className="w-6 h-6 text-orange-600 mr-2" />
                      <h3 className="font-semibold text-black">This Month</h3>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">3 days</p>
                    <p className="text-sm text-black">Leave taken</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Footer />
          </div>
        </AttendanceProvider>
      </WithAuth>
    </SessionProvider>
  );
}
