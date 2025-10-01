import { AttendanceRecord } from '@/types/attendance';

const STORAGE_KEY = 'attendance_records';

export const saveAttendanceRecord = (record: AttendanceRecord): void => {
  try {
    const existingRecords = getAttendanceRecords();
    const updatedRecords = [...existingRecords, record];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
  } catch (error) {
    console.error('Error saving attendance record:', error);
  }
};

export const getAttendanceRecords = (): AttendanceRecord[] => {
  try {
    const records = localStorage.getItem(STORAGE_KEY);
    if (!records) return [];
    
    const parsedRecords = JSON.parse(records);
    // Convert date strings back to Date objects
    return parsedRecords.map((record: any) => ({
      ...record,
      clockIn: new Date(record.clockIn),
      clockOut: record.clockOut ? new Date(record.clockOut) : undefined,
      lunchStart: record.lunchStart ? new Date(record.lunchStart) : undefined,
      lunchEnd: record.lunchEnd ? new Date(record.lunchEnd) : undefined,
    }));
  } catch (error) {
    console.error('Error loading attendance records:', error);
    return [];
  }
};

export const updateAttendanceRecord = (updatedRecord: AttendanceRecord): void => {
  try {
    const records = getAttendanceRecords();
    const updatedRecords = records.map(record => 
      record.id === updatedRecord.id ? updatedRecord : record
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
  } catch (error) {
    console.error('Error updating attendance record:', error);
  }
};

export const deleteAttendanceRecord = (recordId: string): void => {
  try {
    const records = getAttendanceRecords();
    const filteredRecords = records.filter(record => record.id !== recordId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRecords));
  } catch (error) {
    console.error('Error deleting attendance record:', error);
  }
};

export const clearAllRecords = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing attendance records:', error);
  }
};

export const exportRecordsToCSV = (): string => {
  const records = getAttendanceRecords();
  const headers = ['Date', 'Clock In', 'Clock Out', 'Lunch Start', 'Lunch End', 'Working Hours', 'Lunch Duration'];
  
  const csvContent = [
    headers.join(','),
    ...records.map(record => [
      record.date,
      record.clockIn.toLocaleTimeString(),
      record.clockOut?.toLocaleTimeString() || '',
      record.lunchStart?.toLocaleTimeString() || '',
      record.lunchEnd?.toLocaleTimeString() || '',
      record.totalWorkingHours.toFixed(2),
      record.lunchDuration
    ].join(','))
  ].join('\n');
  
  return csvContent;
};
