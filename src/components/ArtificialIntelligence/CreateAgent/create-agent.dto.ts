import { AIInstructions } from 'src/types';

export class CreateAgentDto {
  name: string;
  agentIdentifier?: string | null;
  model?: string | null;
  temperature?: number | null;
  withHistory?: boolean;
  instructions: AIInstructions;
  parser?: {
    name: string;
    description: string;
    schema: any;
  } | null;
}
