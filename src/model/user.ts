import mongoose, { Schema, Document } from "mongoose";

const userSchema: Schema = new Schema({
  name: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  groups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
  blacklistCount: { type: Number, default: 0 },
  flag: { type: String, default: "Active" },
});

export interface User extends Document {
  name: string;
  lastName: string;
  email: string;
  password: string;
  groups: mongoose.Types.ObjectId[];
  blacklistCount: number;
  flag: string;
}

export const UserModel = mongoose.model<User>("User", userSchema);
