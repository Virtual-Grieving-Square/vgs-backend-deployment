import mongoose, { Schema, Document } from "mongoose";

const humanMemorialSchema: Schema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  description: { type: String, required: true },
  dob: { type: Date, required: true },
  dod: { type: Date, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  image: { type: String, required: false },
});

export interface humanMemorial extends Document {
  name: string;
  age: number;
  property: string;
  dob: Date;
  dod: Date;
  author: string;
  image: string;
}

export const HumanMemorial = mongoose.model<humanMemorial>(
  "HumanMemorial",
  humanMemorialSchema
);
