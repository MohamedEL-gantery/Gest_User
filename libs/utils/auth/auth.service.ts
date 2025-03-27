import { BadRequestAppException } from "@/libs/http";
import type { NextApiRequest } from "next";
import { CreateSessionType } from "@/libs/utils/sessions/types";
import { connectToDatabase } from "@/libs/utils/connectDatabase";
import { PasswordService } from "@/libs/crypto/domain";
import { SessionService } from "@/libs/utils/sessions/services/session.service";
import { UserRepository } from "@/libs/nosql-db/repositories/domain/user";
import { AuthServiceI } from "@/libs/utils/auth/interfaces";
import { Types } from "mongoose";
import { User } from "@/libs/nosql-db/contracts/interfaces/user";
import {
  BrowserEnum,
  DeviceEnum,
  OperatingSystemEnum,
  RoleEnum,
} from "@/libs/nosql-db/contracts/enums";

await connectToDatabase();

export class AuthService implements AuthServiceI {
  static instance: AuthService;
  private readonly sessionService: SessionService;
  private readonly userRepository: UserRepository;
  private readonly passwordService: PasswordService;

  private constructor() {
    this.sessionService = SessionService.getInstance();
    this.userRepository = UserRepository.getInstance();
    this.passwordService = PasswordService.getInstance();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async register(
    name: string,
    email: string,
    password: string,
    guestId?: Types.ObjectId
  ): Promise<{ message: string }> {
    try {
      let user;

      if (guestId) {
        user = await this.userRepository.getOne({ _id: guestId });

        if (!user || user.role !== RoleEnum.GestUser) {
          throw new BadRequestAppException("Invalid guest user", 400);
        }

        // Check if the email in the request body already exists in the database
        const existingUser = await this.userRepository.getOne({ email });
        if (existingUser) {
          throw new BadRequestAppException(
            "User with this email already exists",
            400
          );
        }
      } else {
        user = await this.userRepository.getOne({ email });

        if (user) {
          throw new BadRequestAppException("User already exists", 400);
        }
      }

      const hashedPassword = this.passwordService.hashPassword(password);

      if (user) {
        // If the user is a guest, just update their role and password
        await this.userRepository.updateOne(
          { _id: user._id },
          {
            name,
            email,
            hashedPassword,
            role: RoleEnum.User,
            isActive: true,
          }
        );
      } else {
        // If the user doesn't exist, create a new one
        await this.userRepository.createOne({
          name,
          email,
          hashedPassword,
          role: RoleEnum.User,
          isActive: true,
        });
      }

      return { message: "User created successfully" };
    } catch (error) {
      throw new BadRequestAppException(
        error instanceof Error ? error.message : " something went wrong",
        500
      );
    }
  }

  public async login(
    email: string,
    password: string,
    browser: BrowserEnum,
    device: DeviceEnum,
    operatingSystem: OperatingSystemEnum
  ): Promise<{ message: string; session: CreateSessionType }> {
    try {
      const user = await this.UserExists(email);

      const isMatch = this.passwordService.isValidPassword(
        password,
        user.hashedPassword
      );

      if (!isMatch) {
        throw new BadRequestAppException("Invalid credentials", 401);
      }

      const session = await this.sessionService.createSession(
        user._id as Types.ObjectId,
        user.role,
        browser,
        device,
        operatingSystem
      );

      return { message: "Login successfully ", session };
    } catch (error) {
      throw new BadRequestAppException(
        error instanceof Error ? error.message : " something went wrong",
        500
      );
    }
  }

  public async logout(
    req: NextApiRequest,
    userId: Types.ObjectId,
    sessionId: Types.ObjectId,
    message?: string
  ): Promise<{ message: string }> {
    try {
      await this.sessionService.revokeSession(req, userId, sessionId, message);
      return { message: "Logout successful" };
    } catch (error) {
      throw new BadRequestAppException(
        error instanceof Error ? error.message : " something went wrong",
        500
      );
    }
  }

  public async UserExists(email: string): Promise<User> {
    try {
      const userExists = await this.userRepository.getOne({ email }, [
        "_id",
        "hashedPassword",
        "isActive",
        "role",
      ]);

      if (!userExists || userExists.isActive === false) {
        throw new BadRequestAppException(
          "User does not exist or is not active",
          401
        );
      }

      return userExists;
    } catch (error) {
      throw new BadRequestAppException(
        error instanceof Error ? error.message : " something went wrong",
        500
      );
    }
  }
}
