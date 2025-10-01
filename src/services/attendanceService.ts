import { getDatabase } from '@/lib/mongodb';

export interface AttendanceRecord {
  _id?: string;
  userId: string;
  date: string;
  clockIn: Date;
  clockOut?: Date;
  lunchStart?: Date;
  lunchEnd?: Date;
  totalWorkingHours: number;
  lunchDuration: number;
  status: string;
}

export async function getAttendanceRecord(userId: string, date: string): Promise<AttendanceRecord | null> {
  const db = await getDatabase();
  const record = await db.collection('attendances').findOne({ userId, date });
  return record;
}

export async function createAttendanceRecord(record: Omit<AttendanceRecord, '_id'>): Promise<AttendanceRecord> {
  const db = await getDatabase();
  const result = await db.collection('attendances').insertOne(record);
  return { ...record, _id: result.insertedId.toString() };
}

export async function updateAttendanceRecord(userId: string, date: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord | null> {
  const db = await getDatabase();
  const result = await db.collection('attendances').findOneAndUpdate(
    { userId, date },
    { $set: updates },
    { returnDocument: 'after' }
  );
  return result;
}

export async function getAttendanceRecords(userId: string, limit: number = 30): Promise<AttendanceRecord[]> {
  const db = await getDatabase();
  const records = await db.collection('attendances')
    .find({ userId })
    .sort({ date: -1 })
    .limit(limit)
    .toArray();
  return records;
}

export async function getAttendanceStats(userId: string): Promise<{
  avgDailyHours: number;
  workingDays: number;
  attendanceRate: number;
  experience: number;
}> {
  const db = await getDatabase();
  const records = await db.collection('attendances').find({ userId }).toArray();
  
  const totalDays = records.length;
  const totalHours = records.reduce((sum, record) => sum + (record.totalWorkingHours || 0), 0);
  const avgDailyHours = totalDays > 0 ? totalHours / totalDays : 0;
  
  const workingDays = records.filter(record => record.clockIn && record.clockOut).length;
  
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const daysPassed = Math.min(currentDate.getDate(), daysInMonth);
  
  const attendanceRate = daysPassed > 0 ? (workingDays / daysPassed) * 100 : 0;
  
  let experience = 0;
  if (records.length > 0) {
    const firstAttendance = records.reduce((earliest, record) => {
      return new Date(record.date) < new Date(earliest.date) ? record : earliest;
    });
    const monthsDiff = (currentDate.getTime() - new Date(firstAttendance.date).getTime()) / (1000 * 60 * 60 * 24 * 30);
    experience = Math.max(0, monthsDiff / 12);
  }

  return {
    avgDailyHours,
    workingDays,
    attendanceRate,
    experience
  };
}
