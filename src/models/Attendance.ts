import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendance extends Document {
  userId: string; // User email from session
  date: string; // YYYY-MM-DD
  clockIn: Date;
  clockOut?: Date;
  lunchStart?: Date;
  lunchEnd?: Date;
  totalWorkingHours: number;
  lunchDuration: number;
  regularHours: number; // Hours within normal working time (max 8 hours)
  extraHours: number; // Hours beyond normal working time
  extraTimeReason?: string; // Reason for working extra time
  isExtraTimeEnabled: boolean; // Whether extra time tracking is enabled
  status: 'IDLE' | 'WORKING' | 'LUNCH_BREAK' | 'CLOCKED_OUT';
}

const attendanceSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  date: { type: String, required: true },
  clockIn: { type: Date, required: true },
  clockOut: { type: Date },
  lunchStart: { type: Date },
  lunchEnd: { type: Date },
  totalWorkingHours: { type: Number, default: 0 },
  lunchDuration: { type: Number, default: 0 },
  regularHours: { type: Number, default: 0 },
  extraHours: { type: Number, default: 0 },
  extraTimeReason: { type: String },
  isExtraTimeEnabled: { type: Boolean, default: false },
  status: { type: String, enum: ['IDLE', 'WORKING', 'LUNCH_BREAK', 'CLOCKED_OUT'], default: 'IDLE' },
}, {
  timestamps: true,
});

// Ensure only one attendance record per user per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

const Attendance: Model<IAttendance> = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', attendanceSchema);

export default Attendance;
