import { NextApiRequest } from "next";
import { User } from "@/libs/nosql-db/contracts/interfaces/user";
import { Types, ClientSession } from "mongoose";
import {
  BrowserEnum,
  DeviceEnum,
  OperatingSystemEnum,
} from "@/libs/nosql-db/contracts/enums";
import { CreateSessionType } from "@/libs/utils/sessions/types";
import { Session } from "@/libs/nosql-db/contracts/interfaces/session";

export interface CustomRequest extends NextApiRequest {
  user: User;
  sessionId?: Types.ObjectId;
  role: string;
  newAccessToken?: string;
}

export interface sessionServiceI {
  createSession(
    userId: Types.ObjectId,
    role: string,
    browser: BrowserEnum,
    device: DeviceEnum,
    operatingSystem: OperatingSystemEnum
  ): Promise<CreateSessionType>;

  protected(req: NextApiRequest): Promise<{
    success: boolean;
    newAccessToken?: string;
    newRefreshToken?: string;
  }>;

  getCurrentSession(
    userId: Types.ObjectId,
    sessionId: Types.ObjectId
  ): Promise<Session>;

  getAllSessions(
    userId: Types.ObjectId,
    page?: number,
    limit?: number
  ): Promise<{
    data: Session[];
    total: number;
    totalPage: number;
    currentPage: number;
  }>;

  revokeSession(
    req: NextApiRequest,
    userId: Types.ObjectId,
    sessionId: Types.ObjectId,
    message?: string,
    session?: ClientSession
  ): Promise<{ message: string }>;

  regenerateSession(
    refreshToken: string,
    req: NextApiRequest
  ): Promise<{
    success: boolean;
    newAccessToken: string;
  }>;
}
