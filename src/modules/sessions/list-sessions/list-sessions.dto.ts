import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

import { PaginationDto } from 'src/shared/http/pagination.dto';

export class ListSessionsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  agent_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  user_id?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;
}
