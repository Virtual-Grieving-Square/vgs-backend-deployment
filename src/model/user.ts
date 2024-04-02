import mongoose, { Schema, Document } from "mongoose";

const userSchema: Schema = new Schema({
  profileImage: { type: String, required: false },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: false },
  email: { type: String, required: false, unique: true },
  phoneNumber: { type: String, required: false, unique: true },
  subscribed: { type: Boolean, required: true, default: false },
  subscriptionType: { type: String, required: false },
  subscribedDate: { type: Date, required: false },
  balance: { type: Number, required: false, default: 0 },
  groups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
  blacklistCount: { type: Number, default: 0 },
  flag: { type: String, default: "Active" },
  paid: { type: Boolean, default: false },
  signInMethod: { type: String, required: false },
  password: { type: String, required: false },
  accessToekn: { type: String, required: false },
  refreshToken: { type: String, required: false },
  donetions: [{ type: Schema.Types.ObjectId, ref: "donation" }],

});

export interface User extends Document {
  profileImage: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  subscribed: boolean;
  subscriptionType: string;
  subscribedDate: Date;
  balance: number;
  groups: mongoose.Types.ObjectId[];
  blacklistCount: number;
  flag: string;
  paid: boolean;
  signInMethod: string;
  password: string;
  accessToken: string;
  refreshToken: string;
}

export const UserModel = mongoose.model<User>("User", userSchema);
