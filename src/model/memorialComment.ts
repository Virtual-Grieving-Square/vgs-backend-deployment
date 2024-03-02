import mongoose, { Schema, Document } from "mongoose";

const memorialCommentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  memorialId: { type: Schema.Types.ObjectId, ref: "Memorial", required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export interface MemorialComment extends Document {
  userId: string;
  memorialId: string;
  comment: string;
  createdAt: Date;
}

export const MemorialComment = mongoose.model<MemorialComment>(
  "MemorialComment",
  memorialCommentSchema
);