import { Payload, DecodedToken } from "@/libs/jwt/core/contracts/types";
import { SignOptions } from "jsonwebtoken";

export interface CoreJwtServiceI {
  sign(
    payload: Payload,
    secret: string,
    expiresIn: SignOptions["expiresIn"]
  ): string;

  verifyToken(token: string, secret: string): DecodedToken;
}
