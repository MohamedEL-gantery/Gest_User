import "reflect-metadata";
import { Expose } from "class-transformer";
import type { CreateSessionType } from "@/libs/utils/sessions/types";

export class ResponseRegisterDto {
  @Expose()
  message!: string;
}
export class ResponseLoginDto {
  @Expose()
  message!: string;
  @Expose()
  session!: CreateSessionType;
}
