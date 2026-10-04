import { IsEnum, IsOptional, IsString } from 'class-validator';

import { AgentSource } from 'src/shared/contracts/agent-source';

export class GenerateAgentSourceDto {
  @IsString()
  @IsOptional()
  url?: string;

  @IsEnum(AgentSource)
  @IsOptional()
  sourceType?: AgentSource;

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
