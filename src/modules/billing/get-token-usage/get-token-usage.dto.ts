import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class GetTokenUsageDto {
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsUUID()
  organization_id?: string;
}
