import { AIInstructions } from 'src/types';

export class CreateAttendantAgentDto {
  name: string;
  agentIdentifier?: string | null;
  model?: string | null;
  temperature?: number | null;
  withHistory?: boolean;
  instructions: AIInstructions;
}
