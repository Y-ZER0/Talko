import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  IsEnum,
} from "class-validator";
import { MessageMediaType } from "@repo/shared";

export class SendMessageRequestDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsUUID()
  clientId!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  mediaUrl?: string;

  @IsOptional()
  @IsEnum(MessageMediaType)
  mediaType?: MessageMediaType;
}
