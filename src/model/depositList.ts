import mongoose, { Schema, Document } from 'mongoose';

export interface IDepositList extends Document {
  paymentId: string;
  userId: string;
  amount: number;
  paid: boolean;
}

const DepositListSchema: Schema = new Schema({
  paymentId: { type: String, required: true },
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  paid: { type: Boolean, default: false },

  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const DepositListModel = mongoose.model<IDepositList>('DepositList', DepositListSchema);

export default DepositListModel;