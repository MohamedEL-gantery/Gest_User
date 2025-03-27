import { Schema, model } from "mongoose";
import { Session } from "../contracts/interfaces/session";
import mongoose from "mongoose";

const sessionSchema = new Schema<Session>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    refreshTokenHash: { type: String, required: true },
    accessTokenHash: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

sessionSchema.index({ userId: 1 });
sessionSchema.index({ refreshTokenHash: 1 });
sessionSchema.index({ accessTokenHash: 1 });

export const SessionModel =
  mongoose.models.Session || model<Session>("Session", sessionSchema);
