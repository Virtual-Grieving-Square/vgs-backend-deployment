import mongoose, { Schema, Document } from "mongoose";

export interface MemorialComment extends Document {
  userId: string;
  memorialId: string;
  cname: string;
  comment: string;
  authorId: string;
  blocked: boolean;
  likes: number;
  // Timestamp
  createdAt: Date;
}

const memorialCommentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  memorialId: { type: Schema.Types.ObjectId, ref: "Memorial", required: true },
  cname: { type: String, required: true },
  comment: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  blocked: { type: Boolean, default: false },
  likes: { type: Number, default: 0 },
  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const MemorialComment = mongoose.model<MemorialComment>(
  "MemorialComment",
  memorialCommentSchema
);
