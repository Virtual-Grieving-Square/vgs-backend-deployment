import mongoose, { Schema, Document } from 'mongoose';

const adminSchema: Schema = new Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  token: { type: String, required: false },
  password: { type: String, required: true },

  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export interface Admin extends Document {
  fname: string;
  lname: string;
  email: string;
  role: string;
  token: string;
  password: string;
}

export const AdminModel = mongoose.model<Admin>('Admin', adminSchema);