import mongoose, { Schema, Document } from "mongoose";

export interface INotif extends Document {
  Note: string;
  userID: string;
  seen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
  seen: { type: String, required: true },
  Note: { type: Number, default: 0 },
  userID: { type: Schema.Types.ObjectId, ref: "User", required: true },
  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const NotifModel = mongoose.model<INotif>("Notification", NotificationSchema);

export default NotifModel;
