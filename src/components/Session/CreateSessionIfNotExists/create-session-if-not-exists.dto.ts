import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSessionIfNotExistsDto {
  @IsString()
  @IsNotEmpty()
  agent_id: string;

  @IsString()
  @IsOptional()
  user_id?: string;

  @IsDate()
  @IsOptional()
  expires_at?: Date;
}
