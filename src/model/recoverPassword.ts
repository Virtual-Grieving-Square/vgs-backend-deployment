import mongoose, { Schema, Document } from 'mongoose';

const recoverPasswordSchema: Schema = new Schema({
  email: { type: String, required: false, },
  phone: { type: String, required: false },
  code: { type: String, required: false },

  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export interface RecoverPassword extends Document {
  email: string;
  phone: string;
  code: string;
}

export const RecoverPasswordModel = mongoose.model<RecoverPassword>('RecoverPassword', recoverPasswordSchema);