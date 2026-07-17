import { IsString, IsNotEmpty, IsIn } from "class-validator";

export class RegisterTokenRequestDto {
  @IsString()
  @IsNotEmpty()
  fcmToken!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(["web", "ios", "android"])
  platform!: string;
}
