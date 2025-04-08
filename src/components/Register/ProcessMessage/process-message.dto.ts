import { IsNotEmpty, IsString } from 'class-validator';

export class ProcessMessageDto {
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsString()
  sessionId: string;
}
