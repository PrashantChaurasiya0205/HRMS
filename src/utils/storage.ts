// Local storage utilities for attendance data
export const storage = {
  // Get data from localStorage
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting data from localStorage:', error);
      return null;
    }
  },

  // Set data in localStorage
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting data in localStorage:', error);
    }
  },

  // Remove data from localStorage
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data from localStorage:', error);
    }
  },

  // Clear all attendance data
  clear: () => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('attendanceRecords');
      localStorage.removeItem('currentAttendance');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

// Save attendance record to localStorage
export const saveAttendanceRecord = (record: any) => {
  if (typeof window === 'undefined') return;
  try {
    const records = storage.get('attendanceRecords') || [];
    const existingIndex = records.findIndex((r: any) => r.id === record.id);
    
    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }
    
    storage.set('attendanceRecords', records);
  } catch (error) {
    console.error('Error saving attendance record:', error);
  }
};

// Get all attendance records from localStorage
export const getAttendanceRecords = () => {
  if (typeof window === 'undefined') return [];
  try {
    return storage.get('attendanceRecords') || [];
  } catch (error) {
    console.error('Error getting attendance records:', error);
    return [];
  }
};

// Update attendance record in localStorage
export const updateAttendanceRecord = (record: any) => {
  if (typeof window === 'undefined') return;
  try {
    const records = storage.get('attendanceRecords') || [];
    const existingIndex = records.findIndex((r: any) => r.id === record.id);
    
    if (existingIndex >= 0) {
      records[existingIndex] = { ...records[existingIndex], ...record };
      storage.set('attendanceRecords', records);
    }
  } catch (error) {
    console.error('Error updating attendance record:', error);
  }
};

// Export records to CSV format
export const exportRecordsToCSV = () => {
  if (typeof window === 'undefined') return '';
  try {
    const records = getAttendanceRecords();
    if (records.length === 0) return '';
    
    const headers = ['Date', 'Clock In', 'Clock Out', 'Lunch Start', 'Lunch End', 'Total Hours', 'Status'];
    const csvRows = [headers.join(',')];
    
    records.forEach((record: any) => {
      const row = [
        record.date,
        record.clockIn ? new Date(record.clockIn).toLocaleTimeString() : '',
        record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : '',
        record.lunchStart ? new Date(record.lunchStart).toLocaleTimeString() : '',
        record.lunchEnd ? new Date(record.lunchEnd).toLocaleTimeString() : '',
        record.totalWorkingHours || 0,
        record.status || ''
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  } catch (error) {
    console.error('Error exporting records to CSV:', error);
    return '';
  }
};