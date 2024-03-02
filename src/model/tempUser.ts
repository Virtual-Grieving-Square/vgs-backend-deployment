import mongoose, { Schema, Document } from "mongoose";

const tempUserSchema: Schema = new Schema({
  firstname: { type: String, required: true },
  username: { type: String, required: false },
  lastName: { type: String, required: true },
  email: { type: String, required: false, unique: true },
  phoneNumber: { type: String, required: false, unique: true },
  otp: { type: String, required: false },
  password: { type: String, required: true },
});

export interface TempUser extends Document {
  name: string;
  username: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  otp: string;
  password: string;
}

export const TempUserModel = mongoose.model<TempUser>("TempUser", tempUserSchema);