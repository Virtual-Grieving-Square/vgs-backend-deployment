import mongoose, { Schema, Document } from "mongoose";

export interface FCM extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
}

const fcmTokenSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const FCMModel = mongoose.model<FCM>("fcmToken", fcmTokenSchema);
