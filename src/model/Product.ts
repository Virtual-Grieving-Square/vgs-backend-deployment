import mongoose, { Schema, Document } from "mongoose";

export interface Product extends Document {
  name: string;
  type: string;
  price: number;
  product: mongoose.Types.ObjectId[];
  description: string;
  createdAt: Date;
}

const productSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const ProductModel = mongoose.model<Product>("Product", productSchema);
