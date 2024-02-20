import mongoose, { Schema, Document } from 'mongoose';

interface IReaction extends Document {
  reaction: string;
  userId: string;
}

const ReactionSchema: Schema = new Schema({
  reaction: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Assuming userId references the User model
});

const ReactionModel = mongoose.model<IReaction>('Reaction', ReactionSchema);

export default ReactionModel;
