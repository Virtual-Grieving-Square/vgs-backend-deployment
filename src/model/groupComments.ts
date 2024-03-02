import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  groupId: string;
  writingId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

const CommentSchema: Schema = new Schema({
  groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true },
  writingId: {
    type: Schema.Types.ObjectId,
    ref: "GroupWriting",
    required: true,
  },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const GroupComment = mongoose.model<IComment>(
  "GroupComment",
  CommentSchema
);
