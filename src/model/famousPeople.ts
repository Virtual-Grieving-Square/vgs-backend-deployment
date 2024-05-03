import { Schema, model, Document } from 'mongoose';

export interface FamousPeopleInterface extends Document {
  name: string;
  profession: string;
  dob: string;
  dod: string;
  image: string;
  number: number;
}

const FamousPeopleSchema: Schema = new Schema({
  name: { type: String, required: true },
  profession: { type: String, required: true },
  dob: { type: String, required: true },
  dod: { type: String, required: false },
  number: { type: Number, required: true },
  image: { type: String, required: false },

  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const FamousPeopleModel = model<FamousPeopleInterface>('FamousPeople', FamousPeopleSchema);

export default FamousPeopleModel;