import { Schema, model } from "mongoose";
import { User } from "../contracts/interfaces";
import { RoleEnum } from "../contracts/enums";
import mongoose from "mongoose";

const userSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    email: { type: String, required: true, unique: true },
    hashedPassword: {
      type: String,
      required: true,
      select: false,
    },
    role: { type: String, enum: RoleEnum, default: RoleEnum.GestUser },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

export const UserModel =
  mongoose.models.User || model<User>("User", userSchema);
