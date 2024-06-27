import mongoose, { Schema, Document } from "mongoose";

const memorialCommentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  memorialId: { type: Schema.Types.ObjectId, ref: "Memorial", required: true },
  comment: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export interface MemorialComment extends Document {
  userId: string;
  memorialId: string;
  comment: string;
  authorId: string;
  createdAt: Date;
}

export const MemorialComment = mongoose.model<MemorialComment>(
  "MemorialComment",
  memorialCommentSchema
);
