import { IsString, IsNotEmpty } from "class-validator";

export class AddMemberRequestDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
