import {
  AIMessage,
  type BaseMessage,
  isAIMessage,
  isToolMessage,
} from '@langchain/core/messages';

const TOOL_USE_BLOCK_TYPES = new Set([
  'tool_use',
  'server_tool_use',
  'input_json_delta',
  'tool_call',
  'server_tool_call',
  'tool_call_chunk',
]);

type ToolUseContentBlock = { type?: string; id?: string };

const isToolUseBlock = (
  block: ToolUseContentBlock | null | undefined,
): boolean => Boolean(block?.type && TOOL_USE_BLOCK_TYPES.has(block.type));

function toolUseIdsOf(message: AIMessage): string[] {
  const ids: string[] = [];

  for (const call of message.tool_calls ?? []) {
    if (call?.id) ids.push(call.id);
  }
  for (const call of message.invalid_tool_calls ?? []) {
    if (call?.id) ids.push(call.id);
  }
  if (Array.isArray(message.content)) {
    for (const block of message.content as ToolUseContentBlock[]) {
      if (isToolUseBlock(block) && block.id) {
        ids.push(block.id);
      }
    }
  }

  return ids;
}
function stripToolUses(message: AIMessage, removeIds: Set<string>): AIMessage {
  const keep = (id?: string) => !(id && removeIds.has(id));

  let content = message.content;
  if (Array.isArray(content)) {
    content = (content as ToolUseContentBlock[]).filter(
      (block) => !(isToolUseBlock(block) && !keep(block.id)),
    ) as AIMessage['content'];
  }

  return new AIMessage({
    id: message.id,
    name: message.name,
    content,
    additional_kwargs: message.additional_kwargs,
    response_metadata: message.response_metadata,
    usage_metadata: message.usage_metadata,
    tool_calls: (message.tool_calls ?? []).filter((c) => keep(c?.id)),
    invalid_tool_calls: (message.invalid_tool_calls ?? []).filter((c) =>
      keep(c?.id),
    ),
  });
}
function isEmptyAssistantMessage(message: AIMessage): boolean {
  if (message.tool_calls?.length) return false;
  const { content } = message;
  if (typeof content === 'string') return content.trim().length === 0;
  if (Array.isArray(content)) return content.length === 0;
  return !content;
}

export function sanitizeToolCallMessages(
  messages: BaseMessage[],
): BaseMessage[] {
  if (!messages?.length) return messages;
  const resolvedIds = new Set<string>();
  for (const message of messages) {
    if (isToolMessage(message) && message.tool_call_id) {
      resolvedIds.add(message.tool_call_id);
    }
  }

  const keptCallIds = new Set<string>();
  let changed = false;
  const afterCalls: BaseMessage[] = [];

  for (const message of messages) {
    if (!isAIMessage(message)) {
      afterCalls.push(message);
      continue;
    }

    const ids = toolUseIdsOf(message);
    if (ids.length === 0) {
      afterCalls.push(message);
      continue;
    }

    const unresolved = new Set(ids.filter((id) => !resolvedIds.has(id)));
    if (unresolved.size === 0) {
      ids.forEach((id) => keptCallIds.add(id));
      afterCalls.push(message);
      continue;
    }

    changed = true;
    const cleaned = stripToolUses(message, unresolved);
    if (isEmptyAssistantMessage(cleaned)) continue;
    toolUseIdsOf(cleaned).forEach((id) => keptCallIds.add(id));
    afterCalls.push(cleaned);
  }
  const result: BaseMessage[] = [];
  for (const message of afterCalls) {
    if (isToolMessage(message) && !keptCallIds.has(message.tool_call_id)) {
      changed = true;
      continue;
    }
    result.push(message);
  }

  return changed ? result : messages;
}
