import { IsString, IsNumber } from 'class-validator';

export class RecordTokenUsageDto {
  @IsString()
  organization_id: string;

  @IsString()
  agent_id?: string;

  @IsString()
  user_id?: string;

  @IsNumber()
  input_tokens: number;

  @IsNumber()
  output_tokens: number;

  @IsNumber()
  total_tokens: number;

  @IsString()
  model: string;
}
