import { CreateSessionType } from "@/libs/utils/sessions/types";
import {
  BrowserEnum,
  DeviceEnum,
  OperatingSystemEnum,
} from "@/libs/nosql-db/contracts/enums";
import { Types } from "mongoose";
import type { NextApiRequest } from "next";
import { User } from "@/libs/nosql-db/contracts/interfaces/user";

export interface AuthServiceI {
  register(
    name: string,
    email: string,
    password: string
  ): Promise<{ message: string }>;

  login(
    email: string,
    password: string,
    browser: BrowserEnum,
    device: DeviceEnum,
    operatingSystem: OperatingSystemEnum
  ): Promise<{ message: string; session: CreateSessionType }>;

  logout(
    req: NextApiRequest,
    userId: Types.ObjectId,
    sessionId: Types.ObjectId,
    message?: string
  ): Promise<{ message: string }>;

  UserExists(email: string): Promise<User>;
}
