import { ResponseLoginDto, ResponseRegisterDto } from "@/libs/app/auth/dto";
import { NextApiRequest } from "next";
import { AuthAppService } from "@/libs/app/auth/services/auth.service";
import {
  BrowserEnum,
  DeviceEnum,
  OperatingSystemEnum,
} from "@/libs/nosql-db/contracts/enums";
import { Types } from "mongoose";

export class AuthController {
  static instance: AuthController;
  private readonly authAppService: AuthAppService;
  private constructor() {
    this.authAppService = AuthAppService.getInstance();
  }

  public static getInstance(): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController();
    }
    return AuthController.instance;
  }

  public async signup(
    name: string,
    email: string,
    password: string,
    guestId?: Types.ObjectId
  ): Promise<ResponseRegisterDto> {
    return await this.authAppService.signup(
      {
        name,
        email,
        password,
      },
      guestId
    );
  }

  public async login(
    email: string,
    password: string,
    browser: BrowserEnum,
    device: DeviceEnum,
    operatingSystem: OperatingSystemEnum
  ): Promise<ResponseLoginDto> {
    return await this.authAppService.login(
      {
        email,
        password,
      },
      browser,
      device,
      operatingSystem
    );
  }

  public async logout(
    req: NextApiRequest,
    userId: Types.ObjectId,
    sessionId: Types.ObjectId,
    message?: string
  ) {
    return await this.authAppService.logout(req, userId, sessionId, message);
  }
}
