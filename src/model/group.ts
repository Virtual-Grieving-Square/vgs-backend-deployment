import mongoose, { Schema, Document } from 'mongoose';

export interface Group extends Document {
    name: string;
    description: string;
    creator: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
    gallery: { url: string }[];
}

const groupSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    gallery: [{ url: { type: String, required: true } }],

    //Timestamp
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export const GroupModel = mongoose.model<Group>('Group', groupSchema);
