import { AgentMessage } from './agent-message';

export type StreamChunk = {
  model_request?: {
    messages?: AgentMessage[];
    structuredResponse?: { finalAnswer?: string };
  };
  tools?: { messages?: Array<{ name?: string; content?: unknown }> };
};
