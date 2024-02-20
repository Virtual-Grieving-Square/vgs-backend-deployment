import mongoose, { Schema, Document } from 'mongoose';


const userSchema: Schema = new Schema({
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});


export interface User extends Document {
    name: string;
    lastName: string;
    email: string;
    password: string;
}

export const UserModel = mongoose.model<User>('User', userSchema);
