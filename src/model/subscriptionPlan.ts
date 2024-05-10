import mongoose, { Schema, Document } from "mongoose";

const subscriptionPlanSchema: Schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  label: { type: String, required: true },
  storagePerk: { type: Number, required: false, default: 0 },
  details: [
    {
      id: Number,
      title: String,
    },
  ],

  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export interface SubscriptionPlan extends Document {
  name: string;
  price: number;
  label: string;
  storagePerk: Number;
  description: string;
  details: string[];
}


export const SubscriptionPlanModel = mongoose.model<SubscriptionPlan>(
  "SubscriptionPlan",
  subscriptionPlanSchema
);
