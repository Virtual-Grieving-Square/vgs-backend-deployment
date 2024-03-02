import mongoose, { Schema, Document } from "mongoose";

const newsFeedSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

export interface NewsFeed extends Document {
  title: string;
  description: string;
  image: string;
  createdAt: Date;
}

export const NewsFeed = mongoose.model<NewsFeed>("NewsFeed", newsFeedSchema);