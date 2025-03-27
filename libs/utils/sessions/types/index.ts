import { Types } from "mongoose";
export type CreateSessionType = {
  sessionId: Types.ObjectId;
  accessToken: string;
  refreshToken: string;
};
