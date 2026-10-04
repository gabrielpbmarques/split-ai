import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteAgentConnectionDto {
  @IsNotEmpty()
  @IsUUID()
  id!: string;
}
