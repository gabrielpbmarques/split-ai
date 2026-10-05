import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export const REPORT_SENTIMENTS = ['positive', 'negative', 'neutral'] as const;
export const REPORT_TYPES = ['appointment', 'order', 'faq'] as const;

export type ReportSentiment = (typeof REPORT_SENTIMENTS)[number];
export type ReportType = (typeof REPORT_TYPES)[number];

export class GetDashboardDataDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  agent_id?: string;

  @IsOptional()
  agent_ids?: string | string[];

  @IsOptional()
  @IsIn(REPORT_SENTIMENTS)
  sentiment?: ReportSentiment;

  @IsOptional()
  @IsIn(REPORT_TYPES)
  type?: ReportType;

  @IsOptional()
  @IsDateString()
  created_at?: string;

  @IsOptional()
  @IsDateString()
  start?: string;

  @IsOptional()
  @IsDateString()
  end?: string;
}
