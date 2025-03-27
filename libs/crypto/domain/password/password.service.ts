import { CryptoCoreService } from "@/libs/crypto/core/crypto_core.service";
import { BadRequestAppException } from "@/libs/http";
import { PasswordServiceI } from "@/libs/crypto/interfaces";

export class PasswordService implements PasswordServiceI {
  static instance: PasswordService;
  private readonly cryptoCoreService: CryptoCoreService;

  private constructor() {
    this.cryptoCoreService = CryptoCoreService.getInstance();
  }

  public static getInstance(): PasswordService {
    if (!PasswordService.instance) {
      PasswordService.instance = new PasswordService();
    }
    return PasswordService.instance;
  }

  public hashPassword(password: string): string {
    const secret = process.env.PASSWORD_HASH_SECRET;

    if (!secret) {
      throw new BadRequestAppException(
        "PASSWORD_HASH_SECRET is not defined in environment variables.",
        404
      );
    }

    return this.cryptoCoreService.generateHash(password, secret);
  }

  public isValidPassword(password: string, passwordHash: string): boolean {
    const secret = process.env.PASSWORD_HASH_SECRET;

    if (!secret) {
      throw new BadRequestAppException(
        "PASSWORD_HASH_SECRET is not defined in environment variables.",
        404
      );
    }

    return this.cryptoCoreService.compareHash(password, passwordHash, secret);
  }
}
