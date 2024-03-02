import mongoose, { Schema, Document } from 'mongoose';

const adminSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: false },
  privilege: { type: String, required: true },
  role: { type: String, required: true },
  token: { type: String, required: false },
  password: { type: String, required: true },
});

export interface Admin extends Document {
  name: string;
  email: string;
  phoneNumber: string;
  privilege: string;
  role: string;
  token: string;
  password: string;
}

export const AdminModel = mongoose.model<Admin>('Admin', adminSchema);