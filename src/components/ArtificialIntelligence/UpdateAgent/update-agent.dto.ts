import {
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

  @IsObject()
  @IsOptional()
  parser?: {
    name: string;
    description: string;
    schema: any;
  };
}
