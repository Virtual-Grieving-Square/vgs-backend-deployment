import { Schema, model, Document } from 'mongoose';

export interface ISubscription extends Document {
  name: string;
  duration: string;
  description: string;
  price: number;
}

const SubscriptionSchema: Schema = new Schema({
  name: { type: String, required: true },
  duration: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },

  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default model<ISubscription>('Subscription', SubscriptionSchema);
