import mongoose, { Schema, Document } from "mongoose";

export interface IFlower extends Document {
  name: string;
  description: string;
  price: number;
  photos: string;
  type: string;
}

const FlowerSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  price: { type: Number, required: true },
  photos: { type: String, required: true },
  type: { type: String, required: true },
});

const FlowerModel = mongoose.model<IFlower>("Flower", FlowerSchema);

export default FlowerModel;