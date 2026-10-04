import { IsNotEmpty, IsUUID } from 'class-validator';

export class ListAgentConnectionsDto {
  @IsNotEmpty()
  @IsUUID()
  principalAgentId!: string;
}
