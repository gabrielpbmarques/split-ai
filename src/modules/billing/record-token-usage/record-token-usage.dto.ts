import { IsNumber, IsString, MaxLength } from 'class-validator';

export class RecordTokenUsageDto {
  @IsString()
  @MaxLength(255)
  organization_id!: string;

  @IsString()
  @MaxLength(255)
  agent_id?: string;

  @IsString()
  @MaxLength(255)
  user_id?: string;

  @IsNumber()
  input_tokens!: number;

  @IsNumber()
  output_tokens!: number;

  @IsNumber()
  total_tokens!: number;

  @IsString()
  @MaxLength(255)
  model!: string;
}
