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
} from 'class-validator';

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
  @IsBoolean()
  vectorSearchTool?: boolean;

  @IsString()
  @IsNotEmpty()
  @MaxLength(65535)
  systemPrompt!: string;

  @IsOptional()
  @IsObject()
  parser?: {
    name: string;
    description: string;
    schema: Record<string, unknown>;
  } | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(2048, { each: true })
  @ArrayMaxSize(50)
  sites?: string[];
}
