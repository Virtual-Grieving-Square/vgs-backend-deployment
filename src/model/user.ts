import mongoose, { Schema, Document } from "mongoose";

const userSchema: Schema = new Schema({
  firstname: { type: String, required: true },
  username: { type: String, required: false },
  lastName: { type: String, required: true },
  email: { type: String, required: false, unique: true },
  phoneNumber: { type: String, required: false, unique: true },
  subscribed: { type: Boolean, required: true, default: false },
  subscriptionType: { type: String, required: false },
  subscribedDate: { type: Date, required: false },
  balance: { type: Number, required: false, default: 0 },
  groups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
  blacklistCount: { type: Number, default: 0 },
  flag: { type: String, default: "Active" },
  password: { type: String, required: true },
});

export interface User extends Document {
  name: string;
  username: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  subscribed: boolean;
  subscriptionType: string;
  subscribedDate: Date;
  balance: number;
  groups: mongoose.Types.ObjectId[];
  blacklistCount: number;
  flag: string;
  password: string;
}

export const UserModel = mongoose.model<User>("User", userSchema);
