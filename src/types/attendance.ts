export type AttendanceStatus = 'IDLE' | 'WORKING' | 'LUNCH_BREAK' | 'CLOCKED_OUT';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD format
  clockIn: Date;
  clockOut?: Date;
  lunchStart?: Date;
  lunchEnd?: Date;
  totalWorkingHours: number;
  lunchDuration: number; // in minutes
  status: AttendanceStatus;
}

export interface AttendanceState {
  currentRecord: AttendanceRecord | null;
  status: AttendanceStatus;
  currentTime: Date;
  sessionStartTime: Date | null;
  lunchStartTime: Date | null;
  records: AttendanceRecord[];
}

export interface AttendanceAction {
  type: 'CLOCK_IN' | 'CLOCK_OUT' | 'START_LUNCH' | 'END_LUNCH' | 'UPDATE_TIME' | 'LOAD_RECORDS' | 'RESET';
  payload?: any;
}

export interface TimeDisplay {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
}
