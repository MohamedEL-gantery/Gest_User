import { DecodedToken, Payload } from "@/libs/jwt/core/contracts/types";
import { AccessAndRefreshTokenI } from "@/libs/jwt/domain/auth//interfaces";
import { CoreJwtService } from "@/libs/jwt/core/core-jwt.service";
import { SignOptions } from "jsonwebtoken";
import { BadRequestAppException } from "@/libs/http/index";

export class AccessTokenService implements AccessAndRefreshTokenI {
  private static instance: AccessTokenService;
  private readonly coreJwtService: CoreJwtService;

  private constructor() {
    this.coreJwtService = CoreJwtService.getInstance();
  }

  public static getInstance(): AccessTokenService {
    if (!AccessTokenService.instance) {
      AccessTokenService.instance = new AccessTokenService();
    }
    return AccessTokenService.instance;
  }

  public generate(payload: Payload): string {
    const secret = process.env.ACCESS_TOKEN_SECRET;

    const expiresIn = process.env.ACCESS_TOKEN_EXPIRES_AFTER_SECONDS;

    if (!secret) {
      throw new BadRequestAppException("JWT secret is missing!", 404);
    }

    if (!expiresIn) {
      throw new BadRequestAppException("JWT secret is missing!", 404);
    }

    const token = this.coreJwtService.sign(
      payload,
      secret,
      expiresIn as SignOptions["expiresIn"]
    );

    return token;
  }

  public verify(token: string): DecodedToken {
    if (!token) {
      throw new BadRequestAppException("Token is missing!", 401);
    }

    const secret = process.env.ACCESS_TOKEN_SECRET;

    if (!secret) {
      throw new BadRequestAppException("JWT secret is missing!", 404);
    }

    const decodedToken = this.coreJwtService.verifyToken(
      token,
      secret
    ) as DecodedToken;

    return decodedToken;
  }
}
