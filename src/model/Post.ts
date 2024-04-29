import mongoose, { Schema, Document } from 'mongoose';


export interface IPost extends Document {
  title: string;
  content: string;
  createdAt: Date;
  likes: number;
  reacts: number;
  comments: number;
  author: string;
  photos: { url: string }[];
}


const PostSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
  reacts: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  photos: [{ url: { type: String, required: true } }],

  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});


const PostModel = mongoose.model<IPost>('Post', PostSchema);

export default PostModel;
