import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class ResponseFormatDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  description!: string;

  @IsObject()
  properties!: Record<string, { type: string; description: string }>;

  @IsArray()
  @IsString({ each: true })
  @MaxLength(255, { each: true })
  required!: string[];
}

export class CreateAgentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  agentIdentifier?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  model?: string | null;

  @IsOptional()
  @IsNumber()
  temperature?: number | null;

  @IsOptional()
  @IsBoolean()
  withHistory?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  @ArrayMaxSize(50)
  tools?: string[];

  @IsString()
  @IsNotEmpty()
  @MaxLength(65535)
  systemPrompt!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ResponseFormatDto)
  responseFormat?: ResponseFormatDto | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(2048, { each: true })
  @ArrayMaxSize(50)
  sites?: string[];
}
