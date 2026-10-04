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

import { AIInstructions } from 'src/shared/contracts';

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
  databaseTool?: boolean;

  @IsOptional()
  @IsBoolean()
  vectorSearchTool?: boolean;

  @IsOptional()
  @IsObject()
  instructions?: AIInstructions;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(2048)
  @ArrayMaxSize(50)
  sites?: string[] | null;

  @IsOptional()
  @IsObject()
  parser?: {
    name: string;
    description: string;
    schema: any;
  };

  @IsOptional()
  @IsString()
  @MaxLength(255)
  organizationId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  organization_id?: string | null;
}
