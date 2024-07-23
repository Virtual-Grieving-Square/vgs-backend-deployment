import mongoose, { Schema, Document } from "mongoose";

export interface FeePayment extends Document {
  userId: mongoose.Types.ObjectId;
  percentage: number;
}

const FeePaymentSchema: Schema = new Schema({
  _id: {
    type: String,
    default: "feeRecord1",
  },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  percentage: { type: Number, required: true, default: 1.5 },
  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const FeePayment = mongoose.model<FeePayment>(
  "FeePayment",
  FeePaymentSchema
);
