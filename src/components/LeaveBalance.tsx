'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface LeaveBalance {
  sick: number;
  vacation: number;
  personal: number;
  workFromHome: number;
  emergency: number;
}

export default function LeaveBalance() {
  const [user, setUser] = useState<any>(null);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchLeaveBalance();
    }
  }, [user]);

  const fetchLeaveBalance = async () => {
    try {
      const response = await fetch('/api/profile');
      
      if (response.ok) {
        const data = await response.json();
        
        if (data && data.leaveBalance) {
          setLeaveBalance(data.leaveBalance);
        } else {
          // Set default leave balance if user profile doesn't exist
          setLeaveBalance({
            sick: 10,
            vacation: 20,
            personal: 5,
            workFromHome: 12,
            emergency: 3
          });
        }
      } else {
        // Set default leave balance if API fails
        setLeaveBalance({
          sick: 10,
          vacation: 20,
          personal: 5,
          workFromHome: 12,
          emergency: 3
        });
      }
    } catch (error) {
      console.error('Error fetching leave balance:', error);
      // Set default leave balance on error
      setLeaveBalance({
        sick: 10,
        vacation: 20,
        personal: 5,
        workFromHome: 12,
        emergency: 3
      });
    } finally {
      setLoading(false);
    }
  };

  const getBalanceColor = (balance: number, type: string) => {
    if (balance === 0) return 'text-yellow-800 bg-yellow-100';
    
    // Different colors for each leave type when they have balance
    switch (type) {
      case 'sick':
        return 'text-red-800 bg-red-100';
      case 'vacation':
        return 'text-blue-800 bg-blue-100';
      case 'personal':
        return 'text-yellow-800 bg-yellow-100';
      case 'workFromHome':
        return 'text-green-800 bg-green-100';
      case 'emergency':
        return 'text-purple-800 bg-purple-100';
      default:
        return 'text-green-800 bg-green-100';
    }
  };

  const getBalanceIcon = (balance: number) => {
    if (balance === 0) return <AlertCircle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!leaveBalance) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Leave Balance
        </h3>
        <p className="text-gray-600">Unable to load leave balance</p>
      </div>
    );
  }

  const balanceItems = [
    { key: 'sick', label: 'Sick Leave', balance: leaveBalance.sick },
    { key: 'vacation', label: 'Vacation', balance: leaveBalance.vacation },
    { key: 'personal', label: 'Personal', balance: leaveBalance.personal },
    { key: 'workFromHome', label: 'Work from Home', balance: leaveBalance.workFromHome },
    { key: 'emergency', label: 'Emergency', balance: leaveBalance.emergency },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Calendar className="w-5 h-5 mr-2" />
        Leave Balance
      </h3>
      
      <div className="space-y-3">
        {balanceItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </div>
            <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getBalanceColor(item.balance, item.key)}`}>
              {getBalanceIcon(item.balance)}
              <span className="ml-1">{item.balance} days</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p>• Leave balance is automatically updated when requests are approved</p>
          <p>• Contact HR for balance adjustments</p>
        </div>
      </div>
    </div>
  );
}
