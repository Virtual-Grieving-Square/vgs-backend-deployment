import mongoose, { Schema, Document } from "mongoose";

export interface INotif extends Document {
  Note: string;
  userID: string;
  seen: boolean;
  senderId: string;
  type: string;
  notificationtype: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
  seen: { type: String, required: true },
  Note: { type: String, required: true },
  userID: { type: Schema.Types.ObjectId, ref: "User", required: true },
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  notificationtype: { type: String, required: true },
  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const NotifModel = mongoose.model<INotif>("Notification", NotificationSchema);

export default NotifModel;
