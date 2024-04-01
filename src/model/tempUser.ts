import mongoose, { Schema, Document } from "mongoose";

const tempUserSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: false },
  email: { type: String, required: false, unique: true },
  phoneNumber: { type: String, required: false, unique: true },
  otp: { type: String, required: false },
  subscriptionType: { type: String, required: false },
  password: { type: String, required: true },
});

export interface TempUser extends Document {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  otp: string;
  subscriptionType: string;
  password: string;
}

export const TempUserModel = mongoose.model<TempUser>("TempUser", tempUserSchema);