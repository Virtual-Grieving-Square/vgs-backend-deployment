import mongoose, { Schema, Document } from "mongoose";

export interface Wallet extends Document {
  userId: string;
  balance: number;
  flower: number;
}
const walletSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  balance: { type: Number, default: 0 },
  flower: { type: Number, default: 0 },

  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const WalletModel = mongoose.model<Wallet>("Wallet", walletSchema);

