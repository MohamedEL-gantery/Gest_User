import "reflect-metadata";

import { IsBoolean, IsEmail, IsOptional, IsString } from "class-validator";

export class UserUpdateRequestDto {
  @IsOptional()
  @IsString({ message: "name must be a string" })
  name?: string;

  @IsOptional()
  @IsString({ message: "email must be a string" })
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString({ message: "password must be a string" })
  password?: string;

  @IsOptional()
  @IsBoolean({ message: "isActive must be a boolean" })
  isActive?: boolean;
}
