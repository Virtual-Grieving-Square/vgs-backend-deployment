import mongoose, { Schema, Document } from "mongoose";


const petMemorialSchema: Schema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  type: { type: String, required: true },
  DOB: { type: Date, required: true },
  DOD: { type: Date, required: true },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  coverImage: { type: String, required: false },
});

export interface PetMemorial extends Document {
  name: string;
  age: number;
  type: string;
  DOB: Date;
  DOD: Date;
  owner: string;
  coverImage: string;
}

export const PetMemorial = mongoose.model<PetMemorial>("PetMemorial", petMemorialSchema);