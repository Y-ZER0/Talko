import { IsString, IsNotEmpty } from "class-validator";

export class EditMessageRequestDto {
  @IsString()
  @IsNotEmpty()
  content!: string;
}
