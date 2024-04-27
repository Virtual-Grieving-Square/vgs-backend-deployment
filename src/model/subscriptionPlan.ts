import mongoose, { Schema, Document } from "mongoose";

const subscriptionPlanSchema: Schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  label: { type: String, required: true },
  details: [
    {
      id: Number,
      title: String
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
  description: string;
  details: string[];
}

export const SubscriptionPlanModel = mongoose.model<SubscriptionPlan>("SubscriptionPlan", subscriptionPlanSchema);