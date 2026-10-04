import {
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { PaginationDto } from 'src/shared/http/pagination.dto';

export class ListReportsDto extends PaginationDto {
  @IsOptional()
  @IsIn(['positive', 'negative', 'neutral'])
  sentiment?: 'positive' | 'negative' | 'neutral';

  @IsOptional()
  @IsIn(['appointment', 'order', 'faq'])
  type?: 'appointment' | 'order' | 'faq';

  @IsOptional()
  @IsString()
  @MaxLength(64)
  agent_id?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  agent_ids?: string[];

  @IsOptional()
  @IsDateString()
  created_at?: string;
}
