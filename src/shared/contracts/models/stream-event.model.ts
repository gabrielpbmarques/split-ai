export type StreamEvent =
  | { type: 'content'; delta: string }
  | { type: 'status'; phase: 'tool_call' | 'tool_result'; tool: string }
  | { type: 'final'; text: string }
  | { type: 'error'; message: string }
  | { type: 'done' };
