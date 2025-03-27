import { Document, Types } from "mongoose";
import { User } from "../user";

export interface Note extends Document {
  title: string;
  description: string;
  userId: Types.ObjectId | User;
}
