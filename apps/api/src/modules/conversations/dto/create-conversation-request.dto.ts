import {
  IsString,
  IsIn,
  IsOptional,
  IsArray,
  ArrayMinSize,
  IsNotEmpty,
} from "class-validator";

export class CreateConversationRequestDto {
  @IsString()
  @IsIn(["direct", "group"])
  type!: "direct" | "group";

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  participantId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  participantIds?: string[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  groupName?: string;
}
