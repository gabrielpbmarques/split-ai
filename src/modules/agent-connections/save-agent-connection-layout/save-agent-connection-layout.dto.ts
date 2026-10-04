import { IsNotEmpty, IsObject, IsUUID } from 'class-validator';

export class SaveAgentConnectionLayoutDto {
  @IsNotEmpty()
  @IsUUID()
  principalAgentId!: string;

  @IsNotEmpty()
  @IsObject()
  layout!: Record<string, unknown>;
}
