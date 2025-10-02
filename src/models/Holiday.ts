import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHoliday extends Document {
  name: string;
  date: string; // YYYY-MM-DD format
  type: 'NATIONAL' | 'PUBLIC' | 'COMPANY' | 'RELIGIOUS';
  description?: string;
  isRecurring: boolean; // For holidays that repeat yearly
}

const holidaySchema: Schema = new Schema({
  name: { type: String, required: true },
  date: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['NATIONAL', 'PUBLIC', 'COMPANY', 'RELIGIOUS'], 
    required: true 
  },
  description: { type: String },
  isRecurring: { type: Boolean, default: false }
}, {
  timestamps: true,
});

// Ensure unique holidays per date
holidaySchema.index({ date: 1, name: 1 }, { unique: true });

const Holiday: Model<IHoliday> = mongoose.models.Holiday || mongoose.model<IHoliday>('Holiday', holidaySchema);

export default Holiday;
