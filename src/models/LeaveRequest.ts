import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeaveRequest extends Document {
  userId: string; // User email from session
  employeeName: string; // User's name
  leaveType: 'sick' | 'vacation' | 'personal' | 'work-from-home' | 'emergency';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string; // Manager's email
  managerComments?: string;
}

const leaveRequestSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  employeeName: { type: String, required: true },
  leaveType: { 
    type: String, 
    enum: ['sick', 'vacation', 'personal', 'work-from-home', 'emergency'], 
    required: true 
  },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: String },
  managerComments: { type: String }
}, {
  timestamps: true,
});

const LeaveRequest: Model<ILeaveRequest> = mongoose.models.LeaveRequest || mongoose.model<ILeaveRequest>('LeaveRequest', leaveRequestSchema);

export default LeaveRequest;
