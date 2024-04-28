import mongoose, { Schema, Document } from "mongoose";

const emailSubscribeSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },

  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export interface EmailSubscribe extends Document {
  email: string;
}

export const EmailSubscribe = mongoose.model("EmailSubscribe", emailSubscribeSchema);