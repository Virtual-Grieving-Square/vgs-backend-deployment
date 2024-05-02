import { Schema, model, Document } from 'mongoose';

export interface IContactDetails extends Document {
  name: string;
  email: string;
  phoneNumber: string;
  message: string;
}

const ContactDetailsSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: false },
  phoneNumber: { type: String, required: false },
  message: { type: String, required: true },

  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const ContactDetailModel = model<IContactDetails>('ContactDetails', ContactDetailsSchema);

export default ContactDetailModel;