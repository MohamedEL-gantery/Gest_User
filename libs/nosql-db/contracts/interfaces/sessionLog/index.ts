import { Document, Types } from "mongoose";
import { User } from "../user";
import {
  BrowserEnum,
  DeviceEnum,
  OperatingSystemEnum,
  SessionActionTypeEnum,
} from "@/libs/nosql-db/contracts/enums";

export interface SessionLog extends Document {
  userId: Types.ObjectId | User;
  browser: BrowserEnum;
  device: DeviceEnum;
  operatingSystem: OperatingSystemEnum;
  sessionActive: SessionActionTypeEnum;
}
