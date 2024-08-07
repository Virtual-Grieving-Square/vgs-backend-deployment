import mongoose, { Schema, Document } from "mongoose";

export interface Tombstone extends Document {
  name: string;
  description: string;
  image: string;
  type: string;
  userId: string;
  creator: string;
}

const TombstoneSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  image: { type: String, required: true },
  type: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  creator: { type: String, required: true },
  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const TombstoneModel = mongoose.model<Tombstone>("Tombstone", TombstoneSchema);

export default TombstoneModel;
