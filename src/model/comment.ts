import mongoose, { Schema, Document } from 'mongoose';

interface IComment extends Document {
  content: string;
  userId: string;
  reaction?: string; // Assuming reaction is optional
}

const CommentSchema: Schema = new Schema({
  content: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Assuming userId references the User model
  reaction: { type: String }, // Optional field for reaction
});

const CommentModel = mongoose.model<IComment>('Comment', CommentSchema);

export default CommentModel;
