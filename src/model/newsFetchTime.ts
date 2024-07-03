import mongoose, { Schema, Document } from "mongoose";

export interface INewsFetchTime extends Document {
  lastFetchTime: Date;
}

const NewsFetchTimeSchema: Schema = new Schema({
  lastFetchTime: { type: Date, default: Date.now },

  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const NewsFetchTimeModel = mongoose.model<INewsFetchTime>("NewsFetchTime", NewsFetchTimeSchema);

export default NewsFetchTimeModel;