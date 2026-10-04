import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateApiKeyDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  // Optional time-to-live in days. Omit for a non-expiring key.
  @IsOptional()
  @IsInt()
  @IsPositive()
  expiresInDays?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];
}
