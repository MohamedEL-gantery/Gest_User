import "reflect-metadata";
import { IsOptional, IsString } from "class-validator";

export class UpdateNoteRequestDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
