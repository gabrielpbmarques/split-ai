import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class QuestionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  question!: string;

  @IsOptional()
  @IsUUID()
  threadId?: string;

  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;
}
