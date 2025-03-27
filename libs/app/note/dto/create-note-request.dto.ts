import "reflect-metadata";
import { IsNotEmpty, IsString } from "class-validator";
import { Types } from "mongoose";

export class CreateNoteRequestDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNotEmpty()
  userId!: Types.ObjectId;
}
