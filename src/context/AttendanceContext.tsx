'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AttendanceState, AttendanceAction, AttendanceRecord, AttendanceStatus } from '@/types/attendance';
import { calculateWorkingHours, calculateLunchDuration, getCurrentDate } from '@/utils/timeCalculations';
import { getAttendanceRecords, saveAttendanceRecord, updateAttendanceRecord } from '@/utils/storage';

const initialState: AttendanceState = {
  currentRecord: null,
  status: 'IDLE',
  currentTime: new Date(),
  sessionStartTime: null,
  lunchStartTime: null,
  records: [],
};

function attendanceReducer(state: AttendanceState, action: AttendanceAction): AttendanceState {
  switch (action.type) {
    case 'UPDATE_TIME':
      return {
        ...state,
        currentTime: new Date(),
      };

    case 'CLOCK_IN':
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        date: getCurrentDate(),
        clockIn: new Date(),
        totalWorkingHours: 0,
        lunchDuration: 0,
        status: 'WORKING',
      };
      
      return {
        ...state,
        currentRecord: newRecord,
        status: 'WORKING',
        sessionStartTime: new Date(),
        lunchStartTime: null,
      };

    case 'START_LUNCH':
      if (!state.currentRecord) return state;
      
      const updatedRecordWithLunch: AttendanceRecord = {
        ...state.currentRecord,
        lunchStart: new Date(),
        status: 'LUNCH_BREAK',
      };
      
      return {
        ...state,
        currentRecord: updatedRecordWithLunch,
        status: 'LUNCH_BREAK',
        lunchStartTime: new Date(),
      };

    case 'END_LUNCH':
      if (!state.currentRecord || !state.currentRecord.lunchStart) return state;
      
      const lunchEnd = new Date();
      const lunchDuration = calculateLunchDuration(state.currentRecord.lunchStart, lunchEnd);
      
      const updatedRecordAfterLunch: AttendanceRecord = {
        ...state.currentRecord,
        lunchEnd,
        lunchDuration,
        status: 'WORKING',
      };
      
      return {
        ...state,
        currentRecord: updatedRecordAfterLunch,
        status: 'WORKING',
        lunchStartTime: null,
      };

    case 'CLOCK_OUT':
      if (!state.currentRecord) return state;
      
      const clockOut = new Date();
      const totalWorkingHours = calculateWorkingHours(
        state.currentRecord.clockIn,
        clockOut,
        state.currentRecord.lunchStart,
        state.currentRecord.lunchEnd
      );
      
      const finalRecord: AttendanceRecord = {
        ...state.currentRecord,
        clockOut,
        totalWorkingHours,
        status: 'CLOCKED_OUT',
      };
      
      // Save to storage
      saveAttendanceRecord(finalRecord);
      
      return {
        ...state,
        currentRecord: null,
        status: 'IDLE',
        sessionStartTime: null,
        lunchStartTime: null,
        records: [...state.records, finalRecord],
      };

    case 'LOAD_RECORDS':
      return {
        ...state,
        records: action.payload,
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

const AttendanceContext = createContext<{
  state: AttendanceState;
  dispatch: React.Dispatch<AttendanceAction>;
} | null>(null);

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(attendanceReducer, initialState);

  // Load records on mount
  useEffect(() => {
    const records = getAttendanceRecords();
    dispatch({ type: 'LOAD_RECORDS', payload: records });
  }, []);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'UPDATE_TIME' });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AttendanceContext.Provider value={{ state, dispatch }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}
