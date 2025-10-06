'use client';

import AppLayout from '@/components/AppLayout';
import { User, Mail, Calendar, Clock, Settings, Edit, Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

function ProfileContent() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({
    avgDailyHours: 0,
    workingDays: 0,
    attendanceRate: 0,
    experience: 0
  });
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    position: '',
    employeeId: '',
    hireDate: '',
    phone: '',
    address: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  useEffect(() => {
    fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setProfileData(data);
        } else {
          // Initialize with session data if no profile exists
          if (session?.user) {
            setProfileData(prev => ({
              ...prev,
              email: session.user?.email || '',
              firstName: session.user?.name?.split(' ')[0] || '',
              lastName: session.user?.name?.split(' ').slice(1).join(' ') || ''
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/attendance/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  const handleSave = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        setIsEditing(false);
      } else {
        alert('Error updating profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error updating profile');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8" id="profile">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Profile</h1>
        <p className="text-gray-600 text-lg">Manage your personal information and settings</p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">{profileData.firstName} {profileData.lastName}</h2>
              <p className="text-gray-600 mb-4">{profileData.position}</p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {profileData.email}
                </div>
                <div className="flex items-center justify-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Joined: {profileData.hireDate}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors w-full sm:w-auto"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleSave}
                      className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors w-full sm:w-auto"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                    />
                  ) : (
                    <p className="text-black py-3">{profileData.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                    />
                  ) : (
                    <p className="text-black py-3">{profileData.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Email
                  </label>
                  <p className="text-black py-3">{profileData.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Department
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.department}
                      onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                    />
                  ) : (
                    <p className="text-black py-3">{profileData.department}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Position
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.position}
                      onChange={(e) => setProfileData({...profileData, position: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                    />
                  ) : (
                    <p className="text-black py-3">{profileData.position}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Employee ID
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.employeeId}
                      onChange={(e) => setProfileData({...profileData, employeeId: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                    />
                  ) : (
                    <p className="text-black py-3">{profileData.employeeId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Hire Date
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={profileData.hireDate}
                      onChange={(e) => setProfileData({...profileData, hireDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                    />
                  ) : (
                    <p className="text-black py-3">{profileData.hireDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                    />
                  ) : (
                    <p className="text-black py-3">{profileData.phone}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-black mb-2">
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    value={profileData.address}
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                  />
                ) : (
                  <p className="text-black py-3">{profileData.address}</p>
                )}
              </div>

              {/* Emergency Contact Section */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Contact Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.emergencyContact?.name || ''}
                        onChange={(e) => setProfileData({
                          ...profileData, 
                          emergencyContact: {...(profileData.emergencyContact || {}), name: e.target.value}
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                      />
                    ) : (
                      <p className="text-black py-3">{profileData.emergencyContact?.name || ''}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Contact Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profileData.emergencyContact?.phone || ''}
                        onChange={(e) => setProfileData({
                          ...profileData, 
                          emergencyContact: {...(profileData.emergencyContact || {}), phone: e.target.value}
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                      />
                    ) : (
                      <p className="text-black py-3">{profileData.emergencyContact?.phone || ''}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Relationship
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.emergencyContact?.relationship || ''}
                        onChange={(e) => setProfileData({
                          ...profileData, 
                          emergencyContact: {...(profileData.emergencyContact || {}), relationship: e.target.value}
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                      />
                    ) : (
                      <p className="text-black py-3">{profileData.emergencyContact?.relationship || ''}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-blue-600">{stats.avgDailyHours.toFixed(1)}h</h3>
            <p className="text-sm text-gray-600">Avg Daily Hours</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <Calendar className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-green-600">{stats.workingDays}</h3>
            <p className="text-sm text-gray-600">Working Days</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <Settings className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-purple-600">{stats.attendanceRate.toFixed(1)}%</h3>
            <p className="text-sm text-gray-600">Attendance Rate</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <User className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-orange-600">{stats.experience.toFixed(1)}y</h3>
            <p className="text-sm text-gray-600">Experience</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AppLayout>
      <ProfileContent />
    </AppLayout>
  );
}