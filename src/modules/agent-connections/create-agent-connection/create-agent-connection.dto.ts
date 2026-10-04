import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateAgentConnectionDto {
  @IsNotEmpty()
  @IsUUID()
  principalAgentId!: string;

  @IsNotEmpty()
  @IsUUID()
  childAgentId!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'toolName deve conter apenas letras, números, hífen ou underscore.',
  })
  toolName!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10000)
  toolDescription!: string;

  @IsOptional()
  @IsInt()
  position?: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
