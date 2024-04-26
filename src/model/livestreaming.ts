import mongoose, { Schema, Document } from "mongoose";

export interface Livestreaming extends Document {
  meetingId: string;
  creator: mongoose.Types.ObjectId[];
  link: string;
  joinLink: string;
  topic: string;
  BOD: string;
  DOD: string;
  description: string;
  createdAt: Date;
}

const LiveSchema: Schema = new Schema({
  meetingId: { type: String },
  creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
  link: { type: String },
  joinLink: { type: String },
  topic: { type: String },
  BOD: { type: String },
  DOD: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const LiveStreamingModel = mongoose.model<Livestreaming>(
  "liveStreaming",
  LiveSchema
);
