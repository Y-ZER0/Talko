import { IsString, IsOptional, MinLength, MaxLength, IsUrl } from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
