import { UserService } from "@/libs/app/user/services/user.service";
import {
  BrowserEnum,
  DeviceEnum,
  OperatingSystemEnum,
  RoleEnum,
} from "@/libs/nosql-db/contracts/enums";
import { Types } from "mongoose";

export class UserController {
  static instance: UserController;
  private readonly userService: UserService;
  private constructor() {
    this.userService = UserService.getInstance();
  }

  static getInstance(): UserController {
    if (!UserController.instance) {
      UserController.instance = new UserController();
    }
    return UserController.instance;
  }

  public async create(
    browser: BrowserEnum,
    device: DeviceEnum,
    operatingSystem: OperatingSystemEnum
  ) {
    return await this.userService.createGestUser(
      browser,
      device,
      operatingSystem
    );
  }

  public async getAll(role: RoleEnum, page?: number, limit?: number) {
    return await this.userService.getUsers(role, page, limit);
  }

  public async getMe(userId: Types.ObjectId) {
    return await this.userService.getMe(userId);
  }

  public async deleteMe(userId: Types.ObjectId) {
    return await this.userService.deleteMe(userId);
  }

  public async updateMe(
    userId: Types.ObjectId,
    name: string,
    email: string,
    password: string,
    isActive: boolean
  ) {
    return await this.userService.updateMe(userId, {
      name,
      email,
      password,
      isActive,
    });
  }
}
