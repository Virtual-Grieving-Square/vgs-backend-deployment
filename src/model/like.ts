import { Schema, model, Document } from "mongoose";

export interface ILike extends Document {
  likerId: string;
  postId: string;
  Lname: string;
  createdAt: Date;
}

const LikeSchema: Schema = new Schema({
  likerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  Lname: { type: String, required: true },
  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const LikeModel = model<ILike>("Like", LikeSchema);

export default LikeModel;
