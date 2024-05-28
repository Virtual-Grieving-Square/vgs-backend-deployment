import mongoose, { Schema, Document } from "mongoose";

const humanMemorialSchema: Schema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  description: { type: String, required: true },
  dob: { type: Date, required: true },
  dod: { type: Date, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  donations: [{ type: Schema.Types.ObjectId, ref: "Donation" }],
  image: { type: String, required: false },
  relation: { type: String, required: false },
  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export interface humanMemorial extends Document {
  name: string;
  age: number;
  property: string;
  dob: Date;
  description: string;
  dod: Date;
  author: string;
  image: string;
  relation: string;
}

export const HumanMemorial = mongoose.model<humanMemorial>(
  "HumanMemorial",
  humanMemorialSchema
);
