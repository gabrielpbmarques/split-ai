import { IsOptional, IsString, MaxLength } from 'class-validator';

export class GetDashboardDataDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  organization_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  agent_id?: string;

  @IsOptional()
  agent_ids?: string | string[];

  @IsOptional()
  @IsString()
  @MaxLength(20)
  sentiment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  type?: string;
}
