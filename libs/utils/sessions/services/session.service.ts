import { AccessTokenService, RefreshTokenService } from "@/libs/jwt/domain";
import { BadRequestAppException } from "@/libs/http";
import { SessionLogRepository } from "@/libs/nosql-db/repositories/domain/session-log";
import { CreateSessionType } from "@/libs/utils/sessions/types";
import { SessionRepository } from "@/libs/nosql-db/repositories/domain/session";
import { connectToDatabase } from "@/libs/utils/connectDatabase";
import { UserRepository } from "@/libs/nosql-db/repositories/domain/user";
import { DecodedToken } from "@/libs/jwt/core/contracts/types";
import type { NextApiRequest } from "next";
import { Session } from "@/libs/nosql-db/contracts/interfaces/session";
import { Types } from "mongoose";
import {
  BrowserEnum,
  DeviceEnum,
  OperatingSystemEnum,
  SessionActionTypeEnum,
} from "@/libs/nosql-db/contracts/enums";
import {
  CustomRequest,
  sessionServiceI,
} from "@/libs/utils/sessions/interfaces";
import { parseUserAgent } from "@/libs/utils";

await connectToDatabase();

export class SessionService implements sessionServiceI {
  private static instance: SessionService;
  private readonly sessionRepository: SessionRepository;
  private readonly sessionLogRepository: SessionLogRepository;
  private readonly accessTokenService: AccessTokenService;
  private readonly refreshTokenService: RefreshTokenService;
  private readonly userRepository: UserRepository;

  private constructor() {
    this.accessTokenService = AccessTokenService.getInstance();
    this.refreshTokenService = RefreshTokenService.getInstance();
    this.sessionRepository = SessionRepository.getInstance();
    this.sessionLogRepository = SessionLogRepository.getInstance();
    this.userRepository = UserRepository.getInstance();
  }

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  public async createSession(
    userId: Types.ObjectId,
    role: string,
    browser: BrowserEnum,
    device: DeviceEnum,
    operatingSystem: OperatingSystemEnum
  ): Promise<CreateSessionType> {
    const sessionTransaction = await this.sessionRepository.createTransaction();
    try {
      const tempSession = await this.sessionRepository.createOne(
        {
          userId,
          refreshTokenHash: " ",
          accessTokenHash: " ",
        },
        {
          session: sessionTransaction,
        }
      );

      const refreshToken = this.refreshTokenService.generate({
        userId,
        sessionId: tempSession._id as Types.ObjectId,
        role,
      });

      const accessToken = this.accessTokenService.generate({
        userId,
        sessionId: tempSession._id as Types.ObjectId,
        role,
      });

      const tokens = {
        accessToken,
        refreshToken,
      };

      await this.sessionRepository.updateOne(
        { _id: tempSession._id },
        {
          refreshTokenHash: tokens.refreshToken,
          accessTokenHash: tokens.accessToken,
        },
        {
          session: sessionTransaction,
        }
      );

      await this.sessionLogRepository.createOne(
        {
          userId,
          browser,
          device,
          operatingSystem,
          sessionActive: SessionActionTypeEnum.SESSION_CREATED,
        },
        {
          session: sessionTransaction,
        }
      );

      await sessionTransaction.commitTransaction();
      sessionTransaction.endSession();

      return {
        sessionId: tempSession._id as Types.ObjectId,
        ...tokens,
      };
    } catch (error) {
      await sessionTransaction.abortTransaction();
      sessionTransaction.endSession();

      throw new BadRequestAppException(
        error instanceof Error ? error.message : " something went wrong",
        500
      );
    }
  }
  public async getCurrentSession(
    userId: Types.ObjectId,
    sessionId: Types.ObjectId
  ): Promise<Session> {
    return (await this.sessionRepository.getOne({
      userId,
      _id: sessionId,
    })) as Session;
  }

  public async getAllSessions(
    userId: Types.ObjectId,
    page?: number,
    limit?: number
  ): Promise<{
    data: Session[];
    total: number;
    totalPage: number;
    currentPage: number;
  }> {
    return await this.sessionRepository.getAllWithPagination(
      { userId },
      [],
      page,
      limit
    );
  }
  public async revokeSession(
    req: NextApiRequest,
    userId: Types.ObjectId,
    sessionId: Types.ObjectId,
    message?: string
  ): Promise<{ message: string }> {
    await this.sessionRepository.deleteOneOrThrowException(
      { userId, _id: sessionId },
      message || "The session is already revoked!"
    );

    const { browser, device, operatingSystem } = parseUserAgent(
      req.headers["user-agent"]
    );

    await this.sessionLogRepository.createOne({
      userId,
      sessionActive: SessionActionTypeEnum.SESSION_REVOKED,
      browser,
      device,
      operatingSystem,
    });

    return {
      message: message || "The session is already revoked!",
    };
  }

  public async protected(req: NextApiRequest): Promise<{
    success: boolean;
    newAccessToken?: string;
    newRefreshToken?: string;
  }> {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new BadRequestAppException(
        "You are not logged in! Please log in to get access",
        401
      );
    }

    let decodedToken: DecodedToken | null = null;

    try {
      decodedToken = this.accessTokenService.verify(token);
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "TokenExpiredError" &&
        req.cookies.refreshToken
      ) {
        try {
          const refreshedTokens = await this.regenerateSession(
            req.cookies.refreshToken,
            req
          );

          // ✅ Set new access token in `Authorization` header for re-authentication
          req.headers.authorization = `Bearer ${refreshedTokens.newAccessToken}`;

          return { ...refreshedTokens };
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError);
          throw new BadRequestAppException("Session expired or invalid!", 401);
        }
      } else {
        throw new BadRequestAppException("Invalid token!", 401);
      }
    }

    if (!decodedToken) {
      throw new BadRequestAppException("Invalid or missing token!", 401);
    }

    try {
      const [currentUser, session] = await Promise.all([
        this.userRepository.getOne({ _id: decodedToken.userId }),
        this.sessionRepository.getOne({ _id: decodedToken.sessionId }),
      ]);

      if (!currentUser) {
        throw new BadRequestAppException(
          "The user belonging to this token no longer exists",
          401
        );
      }

      if (!session) {
        throw new BadRequestAppException("Session expired or invalid!", 401);
      }

      (req as CustomRequest).user = currentUser;
      (req as CustomRequest).sessionId = decodedToken.sessionId;
      (req as CustomRequest).role = currentUser.role;

      return { success: true };
    } catch (error) {
      if (error instanceof Error && error.name === "JsonWebTokenError") {
        throw new BadRequestAppException("Session expired or invalid!", 401);
      }
      return { success: false };
    }
  }

  public async regenerateSession(
    refreshToken: string,
    req: NextApiRequest
  ): Promise<{
    success: boolean;
    newAccessToken: string;
  }> {
    try {
      const decodedToken = this.refreshTokenService.verify(refreshToken);

      const accessToken = this.accessTokenService.generate({
        userId: decodedToken.userId,
        sessionId: decodedToken.sessionId,
        role: decodedToken.role,
      });

      const updateSession =
        await this.sessionRepository.updateOneOrThrowException(
          { _id: decodedToken.sessionId },
          {
            accessTokenHash: accessToken,
          },
          "Session expired or invalid!"
        );

      if (!updateSession) {
        throw new BadRequestAppException("Session expired or invalid!", 401);
      }

      const [currentUser, session] = await Promise.all([
        this.userRepository.getOne({ _id: decodedToken.userId }),
        this.sessionRepository.getOne({ _id: decodedToken.sessionId }),
      ]);

      if (!currentUser) {
        throw new BadRequestAppException(
          "The user belonging to this token no longer exists",
          401
        );
      }

      if (!session) {
        throw new BadRequestAppException("Session expired or invalid!", 401);
      }

      req.headers.authorization = `Bearer ${accessToken}`;
      (req as CustomRequest).user = currentUser;
      (req as CustomRequest).sessionId = decodedToken.sessionId;
      (req as CustomRequest).role = currentUser.role;

      return {
        success: true,
        newAccessToken: updateSession.accessTokenHash,
      };
    } catch (error) {
      throw new BadRequestAppException(
        error instanceof Error ? error.message : "Something went wrong",
        500
      );
    }
  }
}
