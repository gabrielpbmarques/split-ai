import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsObject,
} from 'class-validator';
import { AIInstructions } from 'src/types';

export class UpdateAgentDto {
  @IsString()
  @IsOptional()
  name?: string;

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
  instructions?: AIInstructions;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sites?: string[] | null;

  @IsObject()
  @IsOptional()
  parser?: {
    name: string;
    description: string;
    schema: any;
  };
}
