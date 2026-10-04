import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSessionIfNotExistsDto {
  @IsString()
  @IsNotEmpty()
  agent_id: string;

  @IsString()
  @IsOptional()
  user_id?: string;

  @IsString()
  @IsOptional()
  organization_id?: string;

  @IsDateString()
  @IsOptional()
  expires_at?: string;
}
