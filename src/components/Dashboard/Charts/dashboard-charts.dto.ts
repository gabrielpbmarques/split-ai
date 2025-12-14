import { IsOptional, IsString, IsDateString } from 'class-validator';

export class DashboardChartsDto {
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

export interface ChartDataset {
  label?: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  tension?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface DashboardCharts {
  sentiment: ChartData;
  conversations: ChartData;
  tokens: ChartData;
}
