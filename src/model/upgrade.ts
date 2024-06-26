import mongoose, { Schema, Document } from "mongoose";

export interface IUpgread extends Document {
  paymentId: string;
  userId: string;
  upgreadType: string;
  paid: boolean;

  createdAt: string;
  updatedAt: string;
}

const UpgreadSchema: Schema = new Schema({
  paymentId: { type: String, required: true },
  userId: { type: String, required: true },
  upgreadType: { type: String, required: true },
  paid: { type: Boolean, default: false },

  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const UpgreadModel = mongoose.model<IUpgread>("Upgread", UpgreadSchema);

export default UpgreadModel;
