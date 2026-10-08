---
description: Use for the chat orchestration
---

## Scope

`ChatModule` (`src/modules/chat/chat.module.ts`) aggregates `QuestionModule` and the internal `RecordChatMessageModule`. `QuestionController` is the only chat entry point; extend it instead of adding a second one. There is no billing, credit check or tenant gate on chat.

## Live endpoint

| Route        | Use case   | Streams?             | Permission | DTO           |
| ------------ | ---------- | -------------------- | ---------- | ------------- |
| `POST /chat` | `question` | yes (Fastify hijack) | `chat.ask` | `QuestionDto` |

`chat.ask` is granted to every role (`admin`, `user`, `guest`); the caller is always a Bearer-JWT user, so `user.id` is a string.

`QuestionDto` (`src/modules/chat/question/question.dto.ts`): `question` and `agentId` (required; `agentId` may be the UUID or the `agent_identifier`), optional `phone`, `name`, `conversationId` (drives thread memory) and `variables?: Record<string, string>` (per-call prompt variables rendered in the `VRS` block; the server-controlled keys `sessionId` / `conversationId` / `threadId` always override them).

## Question flow — src/modules/chat/question/question.service.ts

1. **Session.** `createSessionIfNotExistsService.execute({ agent_id, user_id: user.id })` — reuses the user's active session for that agent.
2. **Resolve agent.** `resolveAgentService.execute(agentId, { ...dto.variables, sessionId, conversationId, threadId })` (`[[ai-agent-runtime]]`). A missing agent throws `NotFoundException`, which the controller turns into an `error` event.
3. **Persist the user message** with `recordChatMessageService.execute(session.id, user.id, agent.id, question, 'user')` before the AI call. A failed run intentionally leaves the user row without a reply, for retry and replay.
4. **Generate.** `generateAiResponseService.execute(question, { session_id, conversation_id, user_id, agent_id }, agent, true)` returns an `AsyncIterable<StreamEvent>`.
5. **Stream loop.** Each `StreamEvent` goes to the controller's `onEvent` callback; the `final` event's `text` is captured.
6. **Persist the agent message** only when `final` produced text. An empty or failed run records nothing for the agent.

## Why Fastify hijack — src/modules/chat/question/question.controller.ts

```ts
res.hijack();
res.raw.writeHead(200, {
  'Content-Type': 'application/x-ndjson; charset=utf-8',
  'Transfer-Encoding': 'chunked',
  'Cache-Control': 'no-store',
  'X-Accel-Buffering': 'no',
  /* CORS headers written by hand, because the reply bypasses Fastify */
});
const writeEvent = (event: StreamEvent) =>
  res.raw.write(`${JSON.stringify(event)}\n`);
```

- `res.hijack()` takes the socket out of Nest's reply pipeline so events can be written as they happen. Never `res.send(...)` after it: the socket is already raw.
- Headers are written before the first event. An exception after that cannot become an `ErrorResponse` (PC-003): the controller's `try/catch` — the only one in a controller — writes `{ type: 'error', message }`, then `{ type: 'done' }` if the service did not already, and ends the stream in `finally`.
- `X-Accel-Buffering: no` defeats proxy buffering (nginx, Cloud Run). Keep it.
- Events are `status` (tool call/result), `final`, `error` and `done`; there are no token deltas.

## RecordChatMessage — the internal use case

- `src/modules/chat/record-chat-message/record-chat-message.service.ts` writes to `messages` (`session_id`, `user_id`, `agent_id`, `from: 'user' | 'agent'`, `message`) and embeds the text through the `EMBEDDINGS` port. It catches and logs every error and never throws, so recording can never abort a chat. Always record through it, never through `MessageRepository` directly.
- A new chat entry point imports `RecordChatMessageModule` into its own use-case module.

## Common pitfalls

- Adding `return res.send(...)` in `QuestionController` after the hijack — breaks streaming with a confusing error.
- Throwing inside the stream loop after events shipped: output on the wire cannot be retracted; you can only append an `error` and `done`.
- Moving the user-message recording after the AI call loses the "user said X" row on failures that retry/replay rely on.
- Reintroducing billing, quotas or tenant checks here needs a product decision recorded in `docs/decisoes-de-dominio.md`.
