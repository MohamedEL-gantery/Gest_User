import { Types } from "mongoose";

export type Payload = {
  userId: Types.ObjectId;
  role: string;
  sessionId: Types.ObjectId;
};

export type DecodedToken = {
  userId: Types.ObjectId;
  sessionId: Types.ObjectId;
  role: string;
  iat: number;
  exp: number;
};
