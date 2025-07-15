import { Schema, model, Document } from "mongoose";

export interface IPlayer extends Document {
  name: string;
  score: number;
  lastUpdated: Date;
}

const PlayerSchema = new Schema<IPlayer>({
  name: { type: String, required: true },
  score: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now },
});

export default model<IPlayer>("Player", PlayerSchema);
