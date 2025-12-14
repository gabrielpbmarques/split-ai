import { IsOptional, IsString, IsDateString } from 'class-validator';

export class DashboardStatisticsDto {
  @IsString()
  @IsOptional()
  period?: 'today' | '7days' | '30days' | 'custom';

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  agentId?: string;
}

export interface DashboardStatistics {
  totalConversations: number;
  totalConversationsChange: number;
  satisfactionRate: number;
  satisfactionRateChange: number;
  tokensUsed: number;
  tokensUsedChange: number;
  activeAgents: number;
  activeAgentsChange: number;
}
