import mongoose, { Schema, Document } from "mongoose";

export interface profane extends Document {
  word: string;
  level: string;
  createdAt: Date;
}

const profaneSchema: Schema = new Schema({
  word: { type: String, required: true },
  level: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const profaneModel = mongoose.model<profane>("Profane", profaneSchema);
