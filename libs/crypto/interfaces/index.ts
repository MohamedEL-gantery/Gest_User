export interface CryptoCoreServiceI {
  generateHash(data: string, secret: string): string;
  compareHash(data: string, hash: string, secret: string): boolean;
}

export interface PasswordServiceI {
  hashPassword(password: string): string;
  isValidPassword(password: string, passwordHash: string): boolean;
}
