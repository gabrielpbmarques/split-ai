---
name: ai-chat-flows
description: 'Use for chat orchestration: POST /chat/:agentId NDJSON streaming (the only chat endpoint), Fastify response hijacking for chunked streaming, and wiring chat into sessions and message persistence. Scope: src/modules/chat/.'
---

## Scope

`ChatModule` (`src/modules/chat/chat.module.ts`) aggregates `QuestionModule` and the internal `RecordChatMessageModule`. `QuestionController` is the only chat entry point; extend it instead of adding a second one. There is no billing, credit check or tenant gate on chat.

## Live endpoint

| Route                 | Use case   | Streams?             | Permission | DTO           |
| --------------------- | ---------- | -------------------- | ---------- | ------------- |
| `POST /chat/:agentId` | `question` | yes (Fastify hijack) | `chat.ask` | `QuestionDto` |

- `agentId` is extracted from the route param (`@Param() param: { agentId: string }`). It accepts the UUID or `agent_identifier`.
- `chat.ask` is granted to every role (`admin`, `user`, `guest`).
- `QuestionDto`: `{ question: string, threadId?: string, variables?: Record<string, string> }`.

## Question flow — src/modules/chat/question/question.service.ts

1. **Session.** `createSessionIfNotExistsService.execute({ agent_id: param.agentId, user_id: user.id, session_id: dto.threadId })` — reuses an explicitly requested session (`dto.threadId`), or reuses/creates the user's active session for that agent (valid for 8 hours).
2. **Resolve agent.** `resolveAgentService.execute(param.agentId)` (`[[ai-agent-runtime]]`). Instantiates `DeepAgent` with `PostgresStore` and tools.
3. **Persist the user message.** `recordChatMessageService.execute(session.id, user.id, agent.id, question, 'user')` before the AI call.
4. **Generate.** `generateAiResponseService.execute(question, { session_id: session.id, conversation_id: dto.threadId, user_id: user.id, agent_id: agent.id }, agent, true)` returns an `AsyncIterable<StreamEvent>`.
5. **Stream loop.** Each `StreamEvent` goes to `onEvent`; the `final` event's `text` is captured.
6. **Persist the agent message** only when `final` produced text.

## Fastify response hijacking — src/modules/chat/question/question.controller.ts

```ts
res.hijack();
res.raw.writeHead(200, {
  'Content-Type': 'application/x-ndjson; charset=utf-8',
  'Transfer-Encoding': 'chunked',
  'Cache-Control': 'no-store',
  'X-Accel-Buffering': 'no',
});
const writeEvent = (event: StreamEvent) => {
  res.raw.write(`${JSON.stringify(event)}\n`);
};
```

- Socket is hijacked for chunked raw NDJSON streaming.
- Headers are sent immediately before events.
- Stream events: `status`, `final`, `error`, `done`.

## RecordChatMessage

- `src/modules/chat/record-chat-message/record-chat-message.service.ts` writes to `messages` and embeds text via `EMBEDDINGS_SERVICE`. Errors are swallowed and logged, preventing chat aborts.

## Common pitfalls

- Calling `res.send(...)` after `res.hijack()` breaks Fastify.
- Changing `POST /chat/:agentId` route parameter breaks client compatibility.
