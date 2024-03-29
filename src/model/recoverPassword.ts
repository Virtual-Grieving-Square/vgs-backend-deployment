import mongoose, { Schema, Document } from 'mongoose';

const recoverPasswordSchema: Schema = new Schema({
  email: { type: String, required: false, },
  phone: { type: String, required: false },
  code: { type: String, required: false },
});

export interface RecoverPassword extends Document {
  email: string;
  phone: string;
  code: string;
}

export const RecoverPasswordModel = mongoose.model<RecoverPassword>('RecoverPassword', recoverPasswordSchema);