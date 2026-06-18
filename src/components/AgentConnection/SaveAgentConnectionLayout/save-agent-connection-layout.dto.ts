import { IsNotEmpty, IsObject, IsUUID } from 'class-validator';

export class SaveAgentConnectionLayoutDto {
  @IsNotEmpty()
  @IsUUID()
  principalAgentId: string;

  // Free-form canvas state for the principal's Agent-Connections canvas, e.g.
  // { viewport: { zoom, x, y }, nodes: { [agentId]: { x, y } } }.
  @IsNotEmpty()
  @IsObject()
  layout: Record<string, any>;
}
