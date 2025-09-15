import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerateAgentSourceDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsOptional()
  sourceType?: string;

  @IsString()
  @IsOptional()
  agentId?: string;
}
