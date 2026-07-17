import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  IsPositive,
} from "class-validator";
import { Type } from "class-transformer";
import { MessageMediaType } from "@repo/shared";

class AttachmentDto {
  @IsString()
  @IsNotEmpty()
  mediaUrl!: string;

  @IsEnum(MessageMediaType)
  mediaType!: MessageMediaType;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  fileSize?: number;
}

export class SendMessageRequestDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}
