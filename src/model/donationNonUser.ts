import mongoose, { Schema, Document } from "mongoose";

export interface DonationNonUser extends Document {
  paymentId: string;
  from: string;
  to: string;
  amount: number;
  note: string;
  description: string;
  paid: boolean;
}

const donationNonUserSchema: Schema = new Schema({
  paymentId: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  amount: { type: Number, required: true },
  note: { type: String, default: "" },
  description: { type: String },
  paid: { type: Boolean, default: false },

  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const DonationNonUserModel = mongoose.model<DonationNonUser>(
  "DonationNonUser",
  donationNonUserSchema
);