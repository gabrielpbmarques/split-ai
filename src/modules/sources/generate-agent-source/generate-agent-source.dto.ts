import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { AgentSource } from 'src/shared/contracts/agent-source';

export class GenerateAgentSourceDto {
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  url?: string;

  @IsOptional()
  @IsEnum(AgentSource)
  sourceType?: AgentSource;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  agentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fileName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  mimeType?: string;

  @IsOptional()
  buffer?: any;
}
