import { AIInstructions } from 'src/types';

export class UpdateAgentDto {
  name?: string;
  agentIdentifier?: string | null;
  model?: string | null;
  temperature?: number | null;
  withHistory?: boolean;
  instructions?: AIInstructions;
  parser?: {
    name: string;
    description: string;
    schema: any;
  } | null;
}
