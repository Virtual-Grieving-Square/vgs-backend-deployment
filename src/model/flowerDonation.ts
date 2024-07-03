import mongoose, { Schema, Document } from "mongoose";

export interface FlowerDonation extends Document {
  from: string;
  to: string;
  amount: number;
  description: string;
  flowerId: string;
  flowerImage: string;
  note: string;
  blocked: boolean;
  likes: number;
  name: string;
  type: string;
  createdAt: Date;
}

const FlowerDonationSchema: Schema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: Schema.Types.ObjectId, ref: "HumanMemorial", required: true },
  amount: { type: Number, required: true },
  id: { type: String, required: true },
  note: { type: String, default: "" },
  flowerId: { type: String, required: true },
  flowerImage: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String },
  blocked: { type: Boolean, default: false },
  likes: { type: Number, defualt: 0 },
  name: { type: String, default: "" },
  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const FlowerDonationModel = mongoose.model<FlowerDonation>(
  "FlowerDonation",
  FlowerDonationSchema
);
