import { Document } from "mongoose";
import { RoleEnum } from "@/libs/nosql-db/contracts/enums";

export interface User extends Document {
  name: string;
  email: string;
  hashedPassword: string;
  role: RoleEnum;
  isActive: boolean;
}
