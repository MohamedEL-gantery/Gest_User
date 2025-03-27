import * as crypto from "crypto";
import { CryptoCoreServiceI } from "@/libs/crypto/interfaces";

export class CryptoCoreService implements CryptoCoreServiceI {
  static instance: CryptoCoreService;

  private constructor() {}

  public static getInstance(): CryptoCoreService {
    if (!CryptoCoreService.instance) {
      CryptoCoreService.instance = new CryptoCoreService();
    }
    return CryptoCoreService.instance;
  }

  public generateHash(data: string, secret: string): string {
    const hash = crypto.createHmac("sha256", secret).update(data).digest("hex");

    return hash;
  }

  public compareHash(data: string, hash: string, secret: string): boolean {
    const hashedData = crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("hex");

    return hashedData === hash;
  }
}
