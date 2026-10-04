---
name: ai-chat-flows
description: 'Use for the chat orchestration: /support/question NDJSON streaming and /chat/attendant, Fastify response hijacking for chunked streaming, and wiring chat into sessions, credits, and message persistence. Scope: src/modules/chat/.'
---

## Scope

`ChatModule` (`src/modules/chat/chat.module.ts`) aggregates `QuestionModule`, `AttendantModule` and the internal `RecordChatMessageModule`. The two controllers are the only chat entry points.

## Live endpoints

| Route                    | Method                       | Streams?             | Auth                                    | DTO                    |
| ------------------------ | ---------------------------- | -------------------- | --------------------------------------- | ---------------------- |
| `POST /support/question` | `QuestionController.handle`  | yes (Fastify hijack) | `chat.ask` (JWT, ApiKey or BravoHub) + active org | `QuestionDto`          |
| `POST /chat/attendant`   | `AttendantController.handle` | no                   | `chat.attend` (JWT only) + active org             | `QuestionDto` (reused) |

`QuestionDto` (`src/modules/chat/question/question.dto.ts`): `question` (required), `agentId` (required), optional `phone`, `name`, `conversationId` (drives thread memory), and `variables?: Record<string, string>` (per-call prompt variables surfaced to the agent; server-controlled keys `sessionId`/`conversationId`/`threadId`/`organizationId` always override anything passed here). No `organizationId`/`companyId` in the DTO — the organization always comes from `AuthenticatedUser` (JWT, API key or embed token resolved by `TokenVerifier`). Attendant imports it from the Question folder — keep them in sync.

## Question flow — orchestrator at src/modules/chat/question/question.service.ts

1. **Credit gate.** A request is `billable` only when `user.organization_id` is set **and** `user.role !== 'service'` (S2S API-key callers carry `role: 'service'` so they skip billing while still being scoped to the right org). For billable requests, call `consumeCreditsService.checkCredits(orgId)`; throw `ForbiddenException('Créditos insuficientes. Por favor, adquira mais créditos para continuar.')` when out.
2. **Session.** `createSessionIfNotExistsService.execute({ agent_id, user_id, organization_id })` — idempotent.
3. **Resolve agent.** `resolveAgentService.execute(agentId, { sessionId })` — loads the agent and builds the runnable (see `[[ai-agent-runtime]]`). Throws `'Agent não encontrado'` (plain `Error`) if missing.
4. **Persist user message.** `recordChatMessageService.execute(session.id, user.id, agent.id, question, 'user')` — writes to `messages` via `MessageRepository`. Failures here are swallowed and only logged — never let recording errors abort the chat.
5. **Generate.** `generateAiResponseService.execute(question, { session_id, user_id, agent_id }, agent, /* stream */ true)` returns an `AsyncGenerator<AIMessageChunk>`.
6. **Stream loop.** `for await (const event of aiResponse)` — pass each `StreamEvent` to the `onEvent` callback (the controller serializes it as one NDJSON line via `writeEvent`: `JSON.stringify(event) + '\n'`). The `type: 'final'` event carries the full answer `text`, captured into `fullResponse`.
7. **Persist agent message + bill.** If `fullResponse` is non-empty: `recordChatMessageService.execute(..., 'agent')`, then `consumeCreditsService.execute(orgId, sessionId, true)`. Empty responses skip both — meaning a failed agent run never consumes a credit. Keep that property if you refactor.

## Why Fastify hijack — question.controller.ts:23-71

```ts
res.hijack();
res.raw.writeHead(200, { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Transfer-Encoding': 'chunked', ... 'X-Accel-Buffering': 'no' });

const writeEvent = (event: StreamEvent) => res.raw.write(`${JSON.stringify(event)}\n`);

await this.questionService.execute(dto, user, (event) => {
  writeEvent(event); // one structured StreamEvent per NDJSON line
});
```

- `res.hijack()` takes the socket out of Nest's response pipeline so we can `res.raw.write(...)` token-by-token. Do **not** add `return res.send(...)` in this controller — it will throw because the socket is already in raw mode.
- Headers must be written **before** the first `res.raw.write`. If you add an early validation that throws after a chunk is emitted, the client sees partial NDJSON events followed by an `error` event then a `done` event — by design (see `catch` block).
- `X-Accel-Buffering: no` defeats nginx/Cloud Run proxy buffering. Don't drop it.

## Attendant flow — src/modules/chat/attendant/attendant.service.ts

Same shape as Question, with three deliberate differences:

- **Resolves the agent first, then creates the session under `agent.organization_id`**, not the user's org. A member of org A calling an attendant owned by org B will produce a session billed/scoped to org B. This is intentional for the attendant model (the agent is the "tenant"), so don't "fix" it without a product conversation.
- **No credit check or consumption.** Attendants don't bill.
- **`stream=false`.** `generateAiResponseService.execute(...)` returns the parsed `finalAnswer` string directly (see `AgentFinalResponseSchema` in `[[ai-agent-runtime]]`). The controller does a plain `res.status(200).send(result)`.

The controller's catch block currently returns `error.message` as the body on 500 — when extending, prefer a sanitized message to avoid leaking internals.

## RecordChatMessage — the only internal use case

- `src/modules/chat/record-chat-message/record-chat-message.service.ts` writes to `messages` via `MessageRepository.create({ session_id, user_id, agent_id, from, message })`. `from` is `'user' | 'agent'`. The service embeds the text through the `EMBEDDINGS` port, catches every error and logs it with the Nest `Logger`; it never throws. Use this everywhere chat history is recorded — do not call `MessageRepository` directly from the orchestrators.
- `RecordChatMessageModule` is imported by `QuestionModule` and `AttendantModule`. If you add a third chat entry point, import `RecordChatMessageModule` into that use case's module.

## Common pitfalls

- Adding `await ... .send(...)` or `return res.send(...)` in `QuestionController` after the hijack — breaks streaming with a confusing error.
- Throwing from inside the `for await` loop after some chunks have shipped — partial output is already on the wire; you can only append, not retract. The current code's `catch` writes an `{ type: 'error', message }` event followed by a `{ type: 'done' }` event, then ends the stream.
- Recording user message **before** the AI call (which the code does) means a failed AI run still leaves a "user said X" row with no "agent said Y". That's intentional — preserve it so retry/replay logic stays correct.
- Credit consumption only fires after a non-empty `fullResponse`. If you short-circuit the stream source (e.g., add a guard rail that early-returns), make sure you do not also bypass billing for legitimate, partial-but-real responses.
