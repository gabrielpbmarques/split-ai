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

  @IsOptional()
  buffer?: any;
}
