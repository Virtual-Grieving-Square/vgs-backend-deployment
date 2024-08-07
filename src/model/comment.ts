import { Schema, model, Document } from "mongoose";

export interface IComment extends Document {
  authorId: string;
  postId: string;
  userId: string;
  cname: string;
  content: string;
  likes: number;
  blocked: boolean;
  createdAt: Date;
}

const CommentSchema: Schema = new Schema({
  authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  cname: { type: String, required: true },
  postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  blocked: { type: Boolean, default: false },
  likes: { type: Number, default: 0 },
  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const CommentModel = model<IComment>("Comment", CommentSchema);

export default CommentModel;
