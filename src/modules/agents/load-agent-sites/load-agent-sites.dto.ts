import { IsString } from 'class-validator';

export class LoadAgentSitesDto {
  @IsString()
  sites: string;

  @IsString()
  agentId: string;
}
