import { format, differenceInMinutes, differenceInHours } from 'date-fns';

export const formatTime = (date: Date): string => {
  return format(date, 'HH:mm:ss');
};

export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const formatDateTime = (date: Date): string => {
  return format(date, 'yyyy-MM-dd HH:mm:ss');
};

export const calculateWorkingHours = (
  clockIn: Date,
  clockOut: Date,
  lunchStart?: Date,
  lunchEnd?: Date
): number => {
  let totalMinutes = differenceInMinutes(clockOut, clockIn);
  
  // Subtract lunch break duration if it exists
  if (lunchStart && lunchEnd) {
    const lunchMinutes = differenceInMinutes(lunchEnd, lunchStart);
    totalMinutes -= lunchMinutes;
  }
  
  return totalMinutes / 60; // Convert to hours
};

export const calculateLunchDuration = (lunchStart: Date, lunchEnd: Date): number => {
  return differenceInMinutes(lunchEnd, lunchStart);
};

export const getCurrentTimeDisplay = (): string => {
  return formatTime(new Date());
};

export const getCurrentDate = (): string => {
  return formatDate(new Date());
};

export const getSessionDuration = (startTime: Date): string => {
  const now = new Date();
  const diffInMinutes = differenceInMinutes(now, startTime);
  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;
  const seconds = Math.floor((now.getTime() - startTime.getTime()) / 1000) % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
