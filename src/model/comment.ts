import { Schema, model, Document } from 'mongoose';


export interface IComment extends Document {
  authorId: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

const CommentSchema: Schema = new Schema({
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  createdAt: { type: Date, default: Date.now }
});

const CommentModel = model<IComment>('Comment', CommentSchema);

export default CommentModel;
