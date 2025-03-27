import { Document, Types } from "mongoose";
import { User } from "../user";

export interface Session extends Document {
  userId: Types.ObjectId | User;
  refreshTokenHash: string;
  accessTokenHash: string;
}
