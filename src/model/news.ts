import mongoose, { Schema, Document } from "mongoose";

export interface INews extends Document {
  source: { id: string; name: string };
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
}

const NewsSchema: Schema = new Schema({
  source: { id: { type: String }, name: { type: String } },
  author: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  url: { type: String, required: true },
  urlToImage: { type: String },
  publishedAt: { type: String },
  content: { type: String },

  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const NewsModel = mongoose.model<INews>("News", NewsSchema);

export default NewsModel;