import mongoose, { Schema, Document } from "mongoose";

const memorialSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  coverImage: { type: String, required: false },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  comments: { type: Number, default: 0 },
  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export interface Memorial extends Document {
  name: string;
  description: string;
  coverImage: string;
  userId: string;
  comments: number;
}

export const Memorial = mongoose.model<Memorial>("Memorial", memorialSchema);