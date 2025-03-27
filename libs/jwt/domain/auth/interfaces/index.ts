import { Payload, DecodedToken } from "@/libs/jwt/core/contracts/types";

export interface AccessAndRefreshTokenI {
  generate(payload: Payload): string;
  verify(token: string): DecodedToken;
}
