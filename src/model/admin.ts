import mongoose, { Schema, Document } from 'mongoose';

export interface Admin extends Document {
  fname: string;
  lname: string;
  email: string;
  role: string;
  token: string;
  type: string;
  suspend: boolean;
  password: string;
}

const adminSchema: Schema = new Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  token: { type: String, required: false },
  suspend: { type: Boolean, required: true, default: false },
  password: { type: String, required: true },
  type: { type: String, required: true, default: "dev" },

  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});



export const AdminModel = mongoose.model<Admin>('Admin', adminSchema);