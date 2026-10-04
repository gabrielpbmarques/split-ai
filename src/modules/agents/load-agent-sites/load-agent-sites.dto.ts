import { IsString, MaxLength } from 'class-validator';

export class LoadAgentSitesDto {
  @IsString()
  @MaxLength(2048)
  sites!: string;

  @IsString()
  @MaxLength(255)
  agentId!: string;
}
