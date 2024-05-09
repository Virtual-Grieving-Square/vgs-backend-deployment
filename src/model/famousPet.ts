import { Schema, model, Document, Model } from "mongoose";

export interface FamousPetInterface extends Document {
  name: string;
  type: string;
  dob: string;
  dod: string;
  image: string;
  number?: number;
}

interface FamousPetModelInterface extends Model<FamousPetInterface> {
  findLastEntry(): Promise<FamousPetInterface | null>;
}

const FamousPetSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  dob: { type: String, required: true },
  dod: { type: String, required: false },
  number: { type: Number, required: false },
  image: { type: String, required: false },

  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Static method to find the last entry
FamousPetSchema.statics.findLastEntry =
  function (): Promise<FamousPetInterface | null> {
    return this.findOne({}, {}, { sort: { number: -1 } });
  };

// Pre-save hook to auto-increment the number field
FamousPetSchema.pre<FamousPetInterface>("save", async function (next) {
  if (this.isNew) {
    try {
      const lastEntry = await FamousPetModel.findLastEntry();
      if (lastEntry && lastEntry.number) {
        this.number = lastEntry.number + 1;
      } else {
        this.number = 1;
      }
      next();
    } catch (error: any) {
      next(error);
    }
  } else {
    next();
  }
});

const FamousPetModel = model<
  FamousPetInterface,
  FamousPetModelInterface
>("FamousPet", FamousPetSchema);

export default FamousPetModel;
