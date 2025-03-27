import { UserRepository } from "@/libs/nosql-db/repositories/domain/user";
import { connectToDatabase } from "@/libs/utils/connectDatabase";
import { BadRequestAppException } from "@/libs/http";
import { SessionService } from "@/libs/utils/sessions/services/session.service";
import { PasswordService } from "@/libs/crypto/domain/password/password.service";
import {
  RoleEnum,
  BrowserEnum,
  DeviceEnum,
  OperatingSystemEnum,
} from "@/libs/nosql-db/contracts/enums";
import { UserUpdateRequestDto } from "@/libs/app/user/dto";
import { v4 as uuidv4 } from "uuid";
import { Types } from "mongoose";

await connectToDatabase();

export class UserService {
  static instance: UserService;
  private readonly userRepository: UserRepository;
  private readonly sessionService: SessionService;
  private readonly passwordService: PasswordService;

  private constructor() {
    this.userRepository = UserRepository.getInstance();
    this.sessionService = SessionService.getInstance();
    this.passwordService = PasswordService.getInstance();
  }

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  public async createGestUser(
    browser: BrowserEnum,
    device: DeviceEnum,
    operatingSystem: OperatingSystemEnum
  ) {
    const guestId = uuidv4();

    try {
      const newUser = await this.userRepository.createOne({
        name: `Guest_${guestId}`,
        email: `guest_${guestId}@example.com`,
        hashedPassword: guestId,
      });

      const session = await this.sessionService.createSession(
        newUser._id as Types.ObjectId,
        RoleEnum.GestUser,
        browser,
        device,
        operatingSystem
      );

      return {
        user: newUser,
        session,
      };
    } catch (error) {
      throw new BadRequestAppException(
        error instanceof Error ? error.message : " something went wrong",
        500
      );
    }
  }

  public async getUsers(role: RoleEnum, page?: number, limit?: number) {
    try {
      if (role !== RoleEnum.Admin) {
        throw new BadRequestAppException(
          "You don't have permission to access this",
          403
        );
      }

      const users = await this.userRepository.getAllWithPagination(
        {},
        [],
        page,
        limit
      );

      return users;
    } catch (error) {
      throw new BadRequestAppException(
        error instanceof Error ? error.message : " something went wrong",
        500
      );
    }
  }

  public async getMe(userId: Types.ObjectId) {
    try {
      return await this.userRepository.getOneOrThrowException(
        { _id: userId },
        [],
        "user not found"
      );
    } catch (error) {
      throw new BadRequestAppException(
        error instanceof Error ? error.message : " something went wrong",
        500
      );
    }
  }

  public async deleteMe(userId: Types.ObjectId) {
    try {
      await this.userRepository.deleteOneOrThrowException(
        { _id: userId },
        "user not found"
      );
      return { message: "User deleted successfully" };
    } catch (error) {
      throw new BadRequestAppException(
        error instanceof Error ? error.message : " something went wrong",
        500
      );
    }
  }

  public async updateMe(
    userId: Types.ObjectId,
    updateUserDto: UserUpdateRequestDto
  ) {
    try {
      const user = await this.checkPermissions(userId);

      const updateUser = await this.userRepository.updateOne(
        { _id: userId },
        {
          name: updateUserDto.name || user.name,
          email: updateUserDto.email || user.email,
          hashedPassword: updateUserDto.password
            ? this.passwordService.hashPassword(updateUserDto.password)
            : user.hashedPassword,
          role: user.role,
          isActive: updateUserDto.isActive || user.isActive,
        }
      );

      return updateUser;
    } catch (error) {
      throw new BadRequestAppException(
        error instanceof Error ? error.message : " something went wrong",
        500
      );
    }
  }

  private async checkPermissions(userId: Types.ObjectId) {
    try {
      const user = await this.userRepository.getOneOrThrowException(
        { _id: userId },
        [],
        "user not found"
      );

      const check = (user._id as Types.ObjectId).equals(userId);

      if (!check) {
        throw new BadRequestAppException(
          "You don't have permission to access this note",
          403
        );
      }

      return user;
    } catch (error) {
      throw new BadRequestAppException(
        error instanceof Error ? error.message : " something went wrong",
        500
      );
    }
  }
}
