import { Schema, model, Query } from "mongoose";
import { SessionLog } from "../contracts/interfaces/sessionLog";
import {
  BrowserEnum,
  DeviceEnum,
  OperatingSystemEnum,
  SessionActionTypeEnum,
} from "../contracts/enums";
import mongoose from "mongoose";

const sessionLogSchema = new Schema<SessionLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    browser: {
      type: String,
      enum: BrowserEnum,
      required: true,
    },
    device: {
      type: String,
      enum: DeviceEnum,
      required: true,
    },
    operatingSystem: {
      type: String,
      enum: OperatingSystemEnum,
      required: true,
    },
    sessionActive: {
      type: String,
      enum: SessionActionTypeEnum,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

sessionLogSchema.index({ userId: 1 });

sessionLogSchema.pre(
  /^find/,
  function (this: Query<SessionLog[], SessionLog>, next) {
    this.populate({
      path: "userId",
      select: "name email",
    });

    next();
  }
);

sessionLogSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
});

export const SessionLogModel =
  mongoose.models.SessionLog ||
  model<SessionLog>("SessionLog", sessionLogSchema);
