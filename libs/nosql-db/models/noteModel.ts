import { Schema, model, Query } from "mongoose";
import { Note } from "../contracts/interfaces";
import mongoose from "mongoose";

const noteSchema = new Schema<Note>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    // to enable virtual populate
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

noteSchema.pre(/^find/, function (this: Query<Note[], Note>, next) {
  this.populate({
    path: "userId",
    select: "name email",
  });

  next();
});

noteSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
});

export const NoteModel =
  mongoose.models.Note || model<Note>("Note", noteSchema);
