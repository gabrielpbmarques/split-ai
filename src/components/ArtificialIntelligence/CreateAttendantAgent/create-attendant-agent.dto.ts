import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsObject,
  IsString,
} from 'class-validator';
import { AIInstructions } from 'src/types';

export class CreateAttendantAgentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  agentIdentifier?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsNumber()
  @IsOptional()
  temperature?: number;

  @IsBoolean()
  @IsOptional()
  withHistory?: boolean;

  @IsObject()
  @IsOptional()
  instructions: AIInstructions;

  @IsString()
  @IsOptional()
  organizationId?: string;

  @IsBoolean()
  @IsOptional()
  databaseTool?: boolean;

  @IsBoolean()
  @IsOptional()
  vectorSearchTool?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sites?: string[];
}
