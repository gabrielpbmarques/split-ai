import { IsOptional, IsString } from 'class-validator';

export class GetActiveSessionDto {
  @IsString()
  @IsOptional()
  user_id?: string;
}
