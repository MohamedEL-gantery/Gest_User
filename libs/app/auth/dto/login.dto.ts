import "reflect-metadata";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginRequestDto {
  @IsEmail()
  @IsString({ message: "email must be a string" })
  @IsNotEmpty()
  email!: string;
  @IsString()
  @IsNotEmpty()
  password!: string;
}
