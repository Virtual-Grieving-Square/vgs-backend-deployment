import mongoose, { Schema, Document } from "mongoose";

const userNotification: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  notification: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, required: true },
});

export interface UserNotification extends Document {
  userId: string;
  notificaiton: string;
  createdAt: Date;
  status: string;
}

export const UserNotification = mongoose.model<UserNotification>("UserNotification", userNotification);