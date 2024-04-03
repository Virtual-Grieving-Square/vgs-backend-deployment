import mongoose, { Schema, Document } from "mongoose";

const humanMemorialSchema: Schema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  Description: { type: String, required: true },
  DOB: { type: Date, required: true },
  DOD: { type: Date, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  coverImage: { type: String, required: false },
});

export interface humanMemorial extends Document {
  name: string;
  age: number;
  Description: string;
  DOB: Date;
  DOD: Date;
  author: string;
  coverImage: string;
}

export const HumanMemorial = mongoose.model<humanMemorial>(
  "HumanMemorial",
  humanMemorialSchema
);
