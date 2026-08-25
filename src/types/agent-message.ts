import { UsageMetadata } from 'langsmith/schemas';

export type AgentMessage = {
  id?: string;
  content?: unknown;
  usage_metadata?: UsageMetadata;
  tool_calls?: Array<{ name?: string; args?: { finalAnswer?: unknown } }>;
};
