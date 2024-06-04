import { Schema, model } from "mongoose";
import { IWeighIn, IWeighIns } from "../interfaces/IWeighIns";
import Joi from "joi";

const weighInSchema = new Schema<IWeighIn>({
  date: { type: Date, default: Date.now() },
  weight: Number,
});

const weighInsSchema = new Schema<IWeighIns>({
  userId: { type: Schema.Types.ObjectId, ref: "users" },
  weighIns: [weighInSchema],
});

export const WeighIns = model("weighIns", weighInSchema);

export const WeighInSchemaValidation = Joi.object({
  userId: { type: Schema.Types.ObjectId, ref: "users" },
  weight: Joi.number().min(1).max(600),
});
