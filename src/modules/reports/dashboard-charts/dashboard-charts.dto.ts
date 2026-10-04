import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class DashboardChartsDto {
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
