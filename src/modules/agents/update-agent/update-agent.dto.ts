import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateAgentDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  agentIdentifier?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  model?: string;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsBoolean()
  withHistory?: boolean;

  @IsOptional()
  @IsBoolean()
  vectorSearchTool?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(65535)
  systemPrompt?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(2048, { each: true })
  @ArrayMaxSize(50)
  sites?: string[] | null;

  @IsOptional()
  @IsObject()
  parser?: {
    name: string;
    description: string;
    schema: Record<string, unknown>;
  };
}
