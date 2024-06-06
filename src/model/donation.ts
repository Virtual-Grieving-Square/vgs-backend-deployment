import mongoose, { Schema, Document } from "mongoose";

export interface Donation extends Document {
  from: string;
  to: string;
  amount: number;
  note: string;
  description: string;
}

const donationSchema: Schema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: Schema.Types.ObjectId, ref: "HumanMemorial", required: true },
  amount: { type: Number, required: true },
  note: { type: String, default: "" },
  // product: [{ type: Schema.Types.ObjectId, ref: "products" }],
  description: { type: String },

  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const DonationModel = mongoose.model<Donation>(
  "Donation",
  donationSchema
);
