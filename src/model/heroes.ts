// import mongoose, { Schema, Document } from "mongoose";

// const heroesSchema: Schema = new Schema({
//   name: { type: String, required: true },
//   age: { type: Number, required: true },
//   description: { type: String, required: true },
//   dob: { type: Date, required: true },
//   dod: { type: Date, required: true },
//   author: { type: Schema.Types.ObjectId, ref: "User", required: true },
//   donations: [{ type: Schema.Types.ObjectId, ref: "Donation" }],
//   image: { type: String, required: false },
//   relation: { type: String, required: false },
//   //Timestamp
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
// });

// export interface heroes extends Document {
//   name: string;
//   age: number;
//   property: string;
//   dob: Date;
//   description: string;
//   dod: Date;
//   author: string;
//   image: string;
//   relation: string;
// }

// export const Heroes = mongoose.model<heroes>(
//   "heroes",
//   heroesSchema
// );

import mongoose, { Schema, Document } from "mongoose";

export interface heroes extends Document {
  name: string;
  age: number;
  property: string;
  dob: Date;
  description: string;
  dod: Date;
  author: string;
  image: string;
  relation: string;
  memorialNote: string;
  tombstone: boolean;
  tombstoneId: string;
}

const heroesSchema: Schema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  description: { type: String, required: true },
  dob: { type: Date, required: true },
  dod: { type: Date, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  donations: [{ type: Schema.Types.ObjectId, ref: "Donation" }],
  image: { type: String, required: false },
  relation: { type: String, required: false },
  memorialNote: { type: String, default: "" },
  tombstone: { type: Boolean, default: false },
  tombstoneId: { type: String, required: false },

  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Heroes = mongoose.model<heroes>(
  "heroes",
  heroesSchema
);
