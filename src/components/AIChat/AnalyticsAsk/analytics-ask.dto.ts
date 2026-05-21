import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class AnalyticsAskDto {
  @IsString()
  @MinLength(1)
  question: string;

  @IsInt()
  @IsPositive()
  companyId: number;

  @IsString()
  @Length(8, 64)
  conversationId: string;

  @IsOptional()
  @IsString()
  agentIdentifier?: string;
}
