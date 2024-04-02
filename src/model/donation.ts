import mongoose, { Schema, Document } from "mongoose";

export interface Donation extends Document {
  from: string;
  to: string;
  amount: number;
  product: mongoose.Types.ObjectId[];
  description: string;
  createdAt: Date;
}

const donationSchema: Schema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  product: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const DonationModel = mongoose.model<Donation>(
  "Donation",
  donationSchema
);
