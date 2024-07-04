import mongoose, { Schema, Document } from "mongoose";

export interface usersTombstone extends Document {
  userId: string;
  name: string;
  description: string;
  image: string;
}

const UsersTombstoneSchema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: false },
  image: { type: String, required: true },

  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const UsersTombstoneModel = mongoose.model<usersTombstone>(
  "usersTombstone",
  UsersTombstoneSchema
);

export default UsersTombstoneModel;
