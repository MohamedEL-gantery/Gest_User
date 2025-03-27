import jwt, { SignOptions } from "jsonwebtoken";
import { Payload, DecodedToken } from "@/libs/jwt/core/contracts/types";
import { CoreJwtServiceI } from "@/libs/jwt/core/contracts/interfaces";

export class CoreJwtService implements CoreJwtServiceI {
  private static instance: CoreJwtService;

  private constructor() {}

  public static getInstance(): CoreJwtService {
    if (!CoreJwtService.instance) {
      CoreJwtService.instance = new CoreJwtService();
    }
    return CoreJwtService.instance;
  }

  public sign(
    payload: Payload,
    secret: string,
    expiresIn: SignOptions["expiresIn"]
  ): string {
    const token = jwt.sign(payload, secret, { expiresIn });

    return token;
  }

  public verifyToken(token: string, secret: string): DecodedToken {
    const decodedToken = jwt.verify(token, secret) as DecodedToken;

    return decodedToken;
  }
}
