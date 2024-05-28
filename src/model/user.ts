import mongoose, { Schema, Document } from "mongoose";

const userSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: false },
  email: { type: String, required: false, unique: true },
  phoneNumber: { type: String, required: false, unique: false },
  subscribed: { type: Boolean, required: true, default: false },
  subscriptionType: { type: String, required: false },
  subscriptionId: { type: String, default: "", required: false },
  subscribedDate: { type: Date, required: false },
  balance: { type: Number, required: false, default: 0 },
  groups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
  blacklistCount: { type: Number, default: 0 },
  banCount: { type: Number, default: 0 },
  banExpiry: { type: Date, default: null }, // January 1, 1970, as default
  flag: { type: String, default: "active" },
  paid: { type: Boolean, default: false },
  signInMethod: { type: String, required: false },
  password: { type: String, required: false },
  accessToekn: { type: String, required: false },
  refreshToken: { type: String, required: false },
  firstTimePaid: { type: Boolean, default: false },
  donations: [{ type: Schema.Types.ObjectId, ref: "donation" }],
  profileImage: { type: String, required: false },
  coverImage: { type: String, required: false, default: "https://picsum.photos/1000/350?random=222" },
  storage: { type: Number, default: 0 },
  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export interface User extends Document {
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
  banCount: number;
  banExpiry: Date | null;
  firstTimePaid: boolean;
  flag: string;
  paid: boolean;
  signInMethod: string;
  password: string;
  accessToken: string;
  refreshToken: string;
  storage: number;
  subscriptionId: string;
  profileImage: string;
  coverImage: string;
}

export const UserModel = mongoose.model<User>("User", userSchema);
