import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class QuestionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  question!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  agentId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  conversationId?: string;
  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;
}
