import {
  AIMessage,
  BaseMessage,
  isAIMessage,
  isToolMessage,
} from '@langchain/core/messages';

/**
 * Repairs a conversation history so it never carries a `tool_use` without its
 * matching `tool_result` (or vice-versa) when sent to Anthropic.
 *
 * The LangGraph `PostgresSaver` checkpoints state after each graph super-step.
 * If a run dies between the model step (which persists an assistant message
 * with tool calls) and the tool step (which persists the `ToolMessage`
 * results) — a crash, a deploy, a client disconnect mid-stream, a recursion
 * limit — the thread is left ending on a dangling `tool_use`. Every later turn
 * replays that history and Anthropic rejects the whole request with:
 *
 *   400 messages.N: `tool_use` ids were found without `tool_result` blocks
 *   immediately after: <id>.
 *
 * This filter drops any tool call that has no corresponding tool result, and
 * any tool result that has no corresponding tool call, keeping the pairing
 * Anthropic requires. It is a pure transform — it does not mutate the persisted
 * checkpoint; it only sanitizes the message list on its way to the model.
 */

// Content-block `type`s that Anthropic (v0 array content) and the v1 standard
// content format serialize into a `tool_use` request block. Kept in sync with
// @langchain/anthropic's message_inputs / standard converters.
const TOOL_USE_BLOCK_TYPES = new Set([
  'tool_use',
  'server_tool_use',
  'input_json_delta',
  'tool_call',
  'server_tool_call',
  'tool_call_chunk',
]);

type ToolUseContentBlock = { type?: string; id?: string };

/**
 * Every tool-call id an AIMessage would emit as a `tool_use` block — sourced
 * from both `.tool_calls` (the normalized accessor) and any tool_use content
 * blocks embedded in array content.
 */
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
      if (block && TOOL_USE_BLOCK_TYPES.has(block.type) && block.id) {
        ids.push(block.id);
      }
    }
  }

  return ids;
}

/** Rebuilds an AIMessage with the given tool-call ids removed from every place
 *  they could turn into a `tool_use` block. */
function stripToolUses(message: AIMessage, removeIds: Set<string>): AIMessage {
  const keep = (id?: string) => !(id && removeIds.has(id));

  let content = message.content;
  if (Array.isArray(content)) {
    content = (content as ToolUseContentBlock[]).filter(
      (block) =>
        !(block && TOOL_USE_BLOCK_TYPES.has(block.type) && !keep(block.id)),
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

/** True if an AIMessage carries no textual content and no surviving tool calls,
 *  i.e. it would serialize to an empty assistant turn Anthropic rejects. */
function isEmptyAssistantMessage(message: AIMessage): boolean {
  if (message.tool_calls?.length) return false;
  const { content } = message;
  if (typeof content === 'string') return content.trim().length === 0;
  if (Array.isArray(content)) return content.length === 0;
  return !content;
}

/**
 * Returns a copy of `messages` with dangling tool calls / orphan tool results
 * removed. When nothing is dangling the input is returned untouched, so the
 * common (healthy) path allocates nothing.
 */
export function sanitizeToolCallMessages(
  messages: BaseMessage[],
): BaseMessage[] {
  if (!messages?.length) return messages;

  // Pass 1 — ids that actually have a tool_result.
  const resolvedIds = new Set<string>();
  for (const message of messages) {
    if (isToolMessage(message) && message.tool_call_id) {
      resolvedIds.add(message.tool_call_id);
    }
  }

  // Pass 2 — keep only tool calls whose result is present; track which survive.
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
    if (isEmptyAssistantMessage(cleaned)) continue; // drop empty tool-only turn
    toolUseIdsOf(cleaned).forEach((id) => keptCallIds.add(id));
    afterCalls.push(cleaned);
  }

  // Pass 3 — drop tool results that lost (or never had) their tool call.
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
