import mongoose, { Schema, Document } from "mongoose";

export interface EmailSubscribe extends Document {
  email: string;
  memorials: string[];
}

const emailSubscribeSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  memorials: [{ type: Schema.Types.ObjectId, ref: "Memorial", default: [] }],


  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});



export const EmailSubscribe = mongoose.model("EmailSubscribe", emailSubscribeSchema);