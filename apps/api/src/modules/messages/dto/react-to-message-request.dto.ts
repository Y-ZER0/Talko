import { IsString, IsNotEmpty } from "class-validator";

export class ReactToMessageRequestDto {
  @IsString()
  @IsNotEmpty()
  emoji!: string;
}
