import { IsOptional, IsString } from 'class-validator';

export class GenerateAgentSourceDto {
  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  sourceType?: string;

  @IsString()
  @IsOptional()
  agentId?: string;

  @IsString()
  @IsOptional()
  fileName?: string;

  @IsString()
  @IsOptional()
  mimeType?: string;

  @IsOptional()
  buffer?: any;
}
