import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  ToolMessage,
  isAIMessage,
  isToolMessage,
} from '@langchain/core/messages';

import { sanitizeToolCallMessages } from 'src/shared/utils/sanitize-tool-call-messages';

/** Recomputes the invariant Anthropic enforces: every tool_use id has a
 *  tool_result and every tool_result maps to a surviving tool_use. */
function assertNoDangling(messages: BaseMessage[]): void {
  const toolUseIds = new Set<string>();
  const toolResultIds = new Set<string>();

  for (const message of messages) {
    if (isAIMessage(message)) {
      for (const call of message.tool_calls ?? []) {
        if (call.id) toolUseIds.add(call.id);
      }
      if (Array.isArray(message.content)) {
        for (const block of message.content as {
          type?: string;
          id?: string;
        }[]) {
          if (block?.type === 'tool_use' && block.id) toolUseIds.add(block.id);
        }
      }
    }
    if (isToolMessage(message) && message.tool_call_id) {
      toolResultIds.add(message.tool_call_id);
    }
  }

  for (const id of toolUseIds) {
    expect(toolResultIds.has(id)).toBe(true);
  }
  for (const id of toolResultIds) {
    expect(toolUseIds.has(id)).toBe(true);
  }
}

describe('sanitizeToolCallMessages', () => {
  it('leaves a healthy history untouched (same reference)', () => {
    const messages = [
      new HumanMessage('oi'),
      new AIMessage({
        content: '',
        tool_calls: [{ id: 'a', name: 'execute_sql', args: {} }],
      }),
      new ToolMessage({ content: 'result', tool_call_id: 'a' }),
      new AIMessage('pronto'),
    ];

    const result = sanitizeToolCallMessages(messages);

    expect(result).toBe(messages);
    assertNoDangling(result);
  });

  it('drops a trailing tool-only turn with no tool_result', () => {
    const messages = [
      new HumanMessage('qual o total de descontos?'),
      new AIMessage({
        content: '',
        tool_calls: [
          { id: 'toolu_dangling', name: 'execute_sql', args: { q: '...' } },
        ],
      }),
    ];

    const result = sanitizeToolCallMessages(messages);

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(HumanMessage);
    assertNoDangling(result);
  });

  it('keeps assistant text but strips the dangling tool call', () => {
    const messages = [
      new HumanMessage('oi'),
      new AIMessage({
        content: 'deixa eu consultar',
        tool_calls: [{ id: 'x', name: 'execute_sql', args: {} }],
      }),
    ];

    const result = sanitizeToolCallMessages(messages);

    expect(result).toHaveLength(2);
    const ai = result[1] as AIMessage;
    expect(ai.tool_calls).toHaveLength(0);
    expect(ai.content).toBe('deixa eu consultar');
    assertNoDangling(result);
  });

  it('removes an unresolved tool_use content block from array content', () => {
    const messages = [
      new HumanMessage('oi'),
      new AIMessage({
        content: [
          { type: 'text', text: 'consultando' },
          { type: 'tool_use', id: 'blk', name: 'execute_sql', input: {} },
        ] as any,
        tool_calls: [{ id: 'blk', name: 'execute_sql', args: {} }],
      }),
    ];

    const result = sanitizeToolCallMessages(messages);

    const ai = result[1] as AIMessage;
    expect(ai.tool_calls).toHaveLength(0);
    expect(Array.isArray(ai.content)).toBe(true);
    expect(
      (ai.content as { type?: string }[]).some((b) => b.type === 'tool_use'),
    ).toBe(false);
    assertNoDangling(result);
  });

  it('drops an orphan tool_result with no preceding tool_use', () => {
    const messages = [
      new HumanMessage('oi'),
      new ToolMessage({ content: 'stray', tool_call_id: 'ghost' }),
      new AIMessage('oi de novo'),
    ];

    const result = sanitizeToolCallMessages(messages);

    expect(result.some((m) => isToolMessage(m))).toBe(false);
    assertNoDangling(result);
  });

  it('keeps resolved calls and strips only the unresolved one in a mixed turn', () => {
    const messages = [
      new HumanMessage('oi'),
      new AIMessage({
        content: '',
        tool_calls: [
          { id: 'ok', name: 'execute_sql', args: {} },
          { id: 'bad', name: 'execute_sql', args: {} },
        ],
      }),
      new ToolMessage({ content: 'ok-result', tool_call_id: 'ok' }),
    ];

    const result = sanitizeToolCallMessages(messages);

    const ai = result.find((m) => isAIMessage(m)) as AIMessage;
    expect(ai.tool_calls.map((c) => c.id)).toEqual(['ok']);
    expect(
      result.some(
        (m) => isToolMessage(m) && (m as ToolMessage).tool_call_id === 'ok',
      ),
    ).toBe(true);
    assertNoDangling(result);
  });
});
