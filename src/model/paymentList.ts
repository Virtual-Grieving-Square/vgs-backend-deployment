import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentList extends Document {
  paymentId: string;
  userId: string;
  amount: number;
  paid: boolean;
}

const PaymentListSchema: Schema = new Schema({
  paymentId: { type: String, required: true },
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  paid: { type: Boolean, default: false },

  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const PaymentListModel = mongoose.model<IPaymentList>('PaymentList', PaymentListSchema);

export default PaymentListModel;