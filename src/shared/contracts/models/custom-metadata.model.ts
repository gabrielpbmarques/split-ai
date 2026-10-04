export type CustomMetadata = {
  session_id?: string;
  // Caller-supplied conversation identifier. When present it — not the session
  // — keys the checkpointer thread, so a client starting a new conversation
  // really gets a fresh agent history instead of resuming the session's thread.
  conversation_id?: string;
  user_id?: string;
  agent_id?: string;
  source_type?: string;
  source_id?: string;
  organization_id?: string;
};
