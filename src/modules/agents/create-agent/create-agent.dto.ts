import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

import { AIInstructions } from 'src/shared/contracts';

export class CreateAgentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  agentIdentifier?: string | null;

  @IsString()
  @IsOptional()
  model?: string | null;

  @IsNumber()
  @IsOptional()
  temperature?: number | null;

  @IsBoolean()
  @IsOptional()
  withHistory?: boolean;

  @IsBoolean()
  @IsOptional()
  databaseTool?: boolean;

  @IsBoolean()
  @IsOptional()
  vectorSearchTool?: boolean;

  @IsObject()
  @IsOptional()
  instructions: AIInstructions;

  @IsObject()
  @IsOptional()
  parser?: {
    name: string;
    description: string;
    schema: any;
  } | null;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sites?: string[];
}
