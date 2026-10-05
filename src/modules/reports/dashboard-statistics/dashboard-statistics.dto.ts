import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class DashboardStatisticsDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  period?: 'today' | '7days' | '30days' | 'custom';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  agentId?: string;
}

export interface DashboardStatistics {
  totalConversations: number;
  totalConversationsChange: number;
  satisfactionRate: number;
  satisfactionRateChange: number;
  activeAgents: number;
  activeAgentsChange: number;
}
