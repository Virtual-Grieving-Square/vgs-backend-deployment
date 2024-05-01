import mongoose, { Schema, Document } from "mongoose";

export interface FlowerDonation extends Document {
  from: string;
  to: string;
  amount: number;
  description: string;
  createdAt: Date;
}

const FlowerDonationSchema: Schema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: Schema.Types.ObjectId, ref: "HumanMemorial", required: true },
  amount: { type: Number, required: true },
  id: { type: String, required: true },

  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const FlowerDonationModel = mongoose.model<FlowerDonation>(
  "FlowerDonation",
  FlowerDonationSchema
);
