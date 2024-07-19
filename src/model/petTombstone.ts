import mongoose, { Schema, Document } from "mongoose";

export interface petTombstone extends Document {
  userId: string;
  name: string;
  description: string;
  image: string;
  namePostion: string;
  descPostion: string;
  imagePostion: string;
  datePostion: string;

}

const PetTombstoneSchema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: false },
  image: { type: String, required: true },
  namePostion: { type: String, required: true },
  descPostion: { type: String, required: true },
  imagePostion: { type: String, required: true },
  datePostion: { type: String, required: true },
  
  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const PetTombstoneModel = mongoose.model<petTombstone>(
  "petTombstone",
  PetTombstoneSchema
);

export default PetTombstoneModel;
