import mongoose, { Schema, Document } from "mongoose";

export interface DonationNonUser extends Document {
  paymentId: string;
  from: string;
  to: string;
  amount: number;
  name: string;
  email: string;
  relation: string;
  note: string;
  description: string;
  paid: boolean;
  createdAt: Date;
}

const donationNonUserSchema: Schema = new Schema({
  paymentId: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  amount: { type: Number, required: true },
  name: { type: String, default: "" },
  email: { type: String, default: "" },
  relation: { type: String, default: "" },
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