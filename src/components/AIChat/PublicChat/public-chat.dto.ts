import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class PublicCreateSessionDto {
  @IsString()
  @IsNotEmpty()
  org: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsOptional()
  @IsUUID()
  agentId?: string;
}

export class PublicChatMessageDto {
  @IsString()
  @IsNotEmpty()
  org: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  session_id: string;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsOptional()
  @IsUUID()
  agentId?: string;
}
