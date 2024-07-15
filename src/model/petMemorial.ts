import mongoose, { Schema, Document } from "mongoose";


const petMemorialSchema: Schema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  type: { type: String, required: true },
  DOB: { type: Date, required: true },
  DOD: { type: Date, required: true },
  description: { type: String, required: false },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  coverImage: { type: String, required: false },
  relation: { type: String, required: false },
  petmemorialNote: { type: String, default: "" },
  tombstone: { type: Boolean, default: false },
  tombstoneId: { type: String, required: false },

  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export interface PetMemorial extends Document {
  name: string;
  age: number;
  type: string;
  DOB: Date;
  description: string;
  DOD: Date;
  owner: string;
  coverImage: string;
  relation: string;
  petmemorialNote: string;
  tombstone: boolean;
  tombstoneId: string;

}

export const PetMemorial = mongoose.model<PetMemorial>("PetMemorial", petMemorialSchema);