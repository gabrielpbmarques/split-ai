import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class QuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  agentId: string;
}
