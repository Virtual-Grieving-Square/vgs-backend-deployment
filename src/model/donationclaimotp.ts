import mongoose, { Schema, Document } from 'mongoose';

export interface DonationClaimOtp extends Document {
  otp: string;
  email: string;

}

const donationClaimOtpSchema: Schema = new Schema({
  otp: { type: String, required: true },
  email: { type: String, required: true },

  // TImestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const DonationClaimOtpModel = mongoose.model<DonationClaimOtp>('DonationClaimOtp', donationClaimOtpSchema);
