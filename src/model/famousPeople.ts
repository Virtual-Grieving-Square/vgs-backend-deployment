import { Schema, model, Document, Model } from "mongoose";

export interface FamousPeopleInterface extends Document {
  name: string;
  profession: string;
  dob: string;
  dod: string;
  image: string;
  number?: number;
}

interface FamousPeopleModelInterface extends Model<FamousPeopleInterface> {
  findLastEntry(): Promise<FamousPeopleInterface | null>;
}

const FamousPeopleSchema: Schema = new Schema({
  name: { type: String, required: true },
  profession: { type: String, required: true },
  dob: { type: String, required: true },
  dod: { type: String, required: false },
  number: { type: Number, required: false },
  image: { type: String, required: false },

  //Timestamp
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Static method to find the last entry
FamousPeopleSchema.statics.findLastEntry =
  function (): Promise<FamousPeopleInterface | null> {
    return this.findOne({}, {}, { sort: { number: -1 } });
  };

// Pre-save hook to auto-increment the number field
FamousPeopleSchema.pre<FamousPeopleInterface>("save", async function (next) {
  if (this.isNew) {
    try {
      const lastEntry = await FamousPeopleModel.findLastEntry();
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

const FamousPeopleModel = model<
  FamousPeopleInterface,
  FamousPeopleModelInterface
>("FamousPeople", FamousPeopleSchema);

export default FamousPeopleModel;
