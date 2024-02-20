import mongoose, { Schema, Document } from "mongoose";

interface IPost extends Document {
  title: string;
  content: string;
  createdAt: Date;
  reacts: number;
  comments: number;
  author: string; // Assuming author is a reference to the User model
  photos: { url: string }[];
}

const PostSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  reacts: { type: Number, default: 0 },
  comments: { type: Number, default: 0 }, // Assuming comments are referenced
  author: { type: String, required: true }, // Assuming author is a reference to the User model
  photos: [{ url: { type: String, required: false } }],
});

const PostModel = mongoose.model<IPost>("Post", PostSchema);

export default PostModel;
