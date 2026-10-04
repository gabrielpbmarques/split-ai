import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateSessionIfNotExistsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  agent_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  user_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  organization_id?: string;

  @IsOptional()
  @IsDateString()
  expires_at?: string;
}
