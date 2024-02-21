import { Schema, model, Document } from 'mongoose';


export interface IReaction extends Document {
  userId: string; 
  reactionType: string; 
  postId: string; 
  createdAt: Date; 
}


const ReactionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
  reactionType: { type: String, required: true }, 
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true }, 
  createdAt: { type: Date, default: Date.now }
});


const ReactionModel = model<IReaction>('Reaction', ReactionSchema);

export default ReactionModel;
