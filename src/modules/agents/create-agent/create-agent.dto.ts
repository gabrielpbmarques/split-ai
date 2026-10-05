import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { AIInstructions } from 'src/shared/contracts';

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
  databaseTool?: boolean;

  @IsOptional()
  @IsBoolean()
  vectorSearchTool?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @Matches(/^(postgres|postgresql|mysql|mysql2):\/\//, {
    message:
      'databaseUrl deve começar com postgres://, postgresql://, mysql:// ou mysql2://',
  })
  databaseUrl?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(255, { each: true })
  @ArrayMaxSize(200)
  databaseTables?: string[] | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  databaseSampleRows?: number | null;

  @IsOptional()
  @IsObject()
  instructions!: AIInstructions;

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
