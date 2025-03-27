import { NextApiRequest } from "next";
import { AuthService } from "@/libs/utils/auth/auth.service";
import { Types } from "mongoose";
import {
  LoginRequestDto,
  SignupRequestDto,
  ResponseLoginDto,
  ResponseRegisterDto,
} from "@/libs/app/auth/dto";
import {
  BrowserEnum,
  DeviceEnum,
  OperatingSystemEnum,
} from "@/libs/nosql-db/contracts/enums";

export class AuthAppService {
  static instance: AuthAppService;
  private readonly authService: AuthService;
  private constructor() {
    this.authService = AuthService.getInstance();
  }

  static getInstance(): AuthAppService {
    if (!AuthAppService.instance) {
      AuthAppService.instance = new AuthAppService();
    }
    return AuthAppService.instance;
  }

  public async signup(
    signupRequestDto: SignupRequestDto,
    guestId?: Types.ObjectId
  ): Promise<ResponseRegisterDto> {
    return await this.authService.register(
      signupRequestDto.name,
      signupRequestDto.email,
      signupRequestDto.password,
      guestId
    );
  }

  public async login(
    loginRequestDto: LoginRequestDto,
    browser: BrowserEnum,
    device: DeviceEnum,
    operatingSystem: OperatingSystemEnum
  ): Promise<ResponseLoginDto> {
    return await this.authService.login(
      loginRequestDto.email,
      loginRequestDto.password,
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
  ): Promise<{ message: string }> {
    return await this.authService.logout(req, userId, sessionId, message);
  }
}
