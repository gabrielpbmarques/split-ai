import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class ListSessionsDto {
  @IsOptional()
  @IsString()
  agent_id?: string;

  @IsOptional()
  @IsString()
  user_id?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export interface SessionListItem {
  id: string;
  agent_id: string;
  agent_name: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  created_at: Date;
  expires_at: Date;
  expired: boolean;
  message_count: number;
  last_message?: string;
  last_message_at?: Date;
}

export interface SessionsListResponse {
  sessions: SessionListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
