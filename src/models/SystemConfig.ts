import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemConfig extends Document {
  workingHours: {
    dailyHours: number;
    weeklyHours: number;
    monthlyHours: number;
  };
  updatedAt: Date;
  updatedBy: string;
}

const SystemConfigSchema = new Schema({
  workingHours: {
    dailyHours: { type: Number, default: 8 },
    weeklyHours: { type: Number, default: 40 },
    monthlyHours: { type: Number, default: 160 }
  },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String, required: true }
});

export default mongoose.models.SystemConfig || mongoose.model<ISystemConfig>('SystemConfig', SystemConfigSchema);
