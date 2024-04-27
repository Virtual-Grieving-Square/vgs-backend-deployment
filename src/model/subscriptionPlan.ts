import mongoose, { Schema, Document } from "mongoose";

const subscriptionPlanSchema: Schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: false },
  status: { type: String, required: false },

  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export interface SubscriptionPlan extends Document {
  name: string;
  price: number;
  duration: number;
  status: string;
  createdAt: Date;
}

export const SubscriptionPlanModel = mongoose.model<SubscriptionPlan>("SubscriptionPlan", subscriptionPlanSchema);