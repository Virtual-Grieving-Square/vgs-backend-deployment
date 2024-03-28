import mongoose, { Schema, Document } from "mongoose";

const emailSubscribeSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
});

export interface EmailSubscribe extends Document {
  email: string;
}

export const EmailSubscribe = mongoose.model("EmailSubscribe", emailSubscribeSchema);