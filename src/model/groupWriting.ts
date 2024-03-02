import mongoose, { Schema, Document } from 'mongoose';

export interface IGroupWriting extends Document {
  groupId: string;
  userId: string;
  content: string;
  createdAt: Date;
}


const GroupWritingSchema: Schema = new Schema({
  groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const GroupWriting = mongoose.model<IGroupWriting>('GroupWriting', GroupWritingSchema);