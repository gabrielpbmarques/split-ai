import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateApiKeyDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  expiresInDays?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(255)
  @ArrayMaxSize(100)
  scopes?: string[];
}
