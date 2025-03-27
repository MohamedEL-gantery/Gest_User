import "reflect-metadata";
import { IsEmail, IsString } from "class-validator";

export class SignupRequestDto {
  @IsString({ message: "name must be a string" })
  name!: string;
  @IsEmail()
  @IsString({ message: "email must be a string" })
  email!: string;
  @IsString()
  password!: string;
}
