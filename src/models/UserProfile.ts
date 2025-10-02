import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserProfile extends Document {
  userId: string; // User email from session
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  employeeId?: string;
  hireDate?: string; // YYYY-MM-DD format
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  profilePicture?: string;
}

const userProfileSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  department: { type: String },
  position: { type: String },
  employeeId: { type: String },
  hireDate: { type: String },
  address: { type: String },
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relationship: { type: String }
  },
  profilePicture: { type: String }
}, {
  timestamps: true,
});

const UserProfile: Model<IUserProfile> = mongoose.models.UserProfile || mongoose.model<IUserProfile>('UserProfile', userProfileSchema);

export default UserProfile;
