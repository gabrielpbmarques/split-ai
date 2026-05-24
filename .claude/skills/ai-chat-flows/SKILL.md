---
name: ai-chat-flows
description: 'Use when: editing anything under src/components/AIChat/, modifying the /support/question streaming endpoint or /chat/attendant endpoint, working with Fastify response hijacking for SSE-like chunked streaming, or wiring chat orchestration into sessions, credits, or message persistence.'
---

## Scope

`AIChatModule` (`src/components/AIChat/ai-chat.module.ts`) only registers `QuestionModule` and `AttendantModule`. Those are the only live entry points. The other directories (`AnalyticsAsk/`, `ExtractDocumentData/`, `RecordChatMessage/`) are either empty or internal-only — see the "dead and internal modules" section below.

## Live endpoints

| Route                    | Method                       | Streams?             | Auth                                    | DTO                    |
| ------------------------ | ---------------------------- | -------------------- | --------------------------------------- | ---------------------- |
| `POST /support/question` | `QuestionController.execute` | yes (Fastify hijack) | `CompositeAuthGuard` + `ActiveOrgGuard` | `QuestionDto`          |
| `POST /chat/attendant`   | `AttendantController.handle` | no                   | `AuthGuard` + `ActiveOrgGuard`          | `QuestionDto` (reused) |

`QuestionDto` (`src/components/AIChat/Question/question.dto.ts`): `question` (required), `agentId` (required), optional `phone`, `name`, and `conversationId` (drives thread memory). No `organizationId`/`companyId` — those are dead since `CompositeAuthGuard` always resolves the org (from JWT or from the `chat_embed_token` looked up by `ApiKeyGuard`). Attendant imports it from the Question folder — keep them in sync.

## Question flow — orchestrator at src/components/AIChat/Question/question.service.ts

1. **Credit gate.** A request is `billable` only when `user.organization_id` is set **and** `user.role !== 'service'` (S2S API-key callers carry `role: 'service'` so they skip billing while still being scoped to the right org). For billable requests, call `consumeCreditsService.checkCredits(orgId)`; throw `ForbiddenException('Créditos insuficientes. Por favor, adquira mais créditos para continuar.')` when out.
2. **Session.** `createSessionIfNotExistsService.execute({ agent_id, user_id, organization_id })` — idempotent.
3. **Resolve agent.** `resolveAgentService.execute(agentId, { sessionId })` — loads the agent and builds the runnable (see `[[ai-agent-runtime]]`). Throws `'Agent não encontrado'` (plain `Error`) if missing.
4. **Persist user message.** `recordChatMessageService.execute(session.id, user.id, agent.id, question, 'user')` — writes to `messages` via `MessageRepository`. Failures here are swallowed and only logged — never let recording errors abort the chat.
5. **Generate.** `generateAiResponseService.execute(question, { session_id, user_id, agent_id }, agent, /* stream */ true)` returns an `AsyncGenerator<AIMessageChunk>`.
6. **Stream loop.** `for await (const chunk of aiResponse)` — push `chunk.content` through the `onMessage` callback (the controller writes it raw to the response). Concatenate into `fullResponse`.
7. **Persist agent message + bill.** If `fullResponse` is non-empty: `recordChatMessageService.execute(..., 'agent')`, then `consumeCreditsService.execute(orgId, sessionId, true)`. Empty responses skip both — meaning a failed agent run never consumes a credit. Keep that property if you refactor.

## Why Fastify hijack — question.controller.ts:22-52

```ts
res.hijack();
res.raw.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked', ... 'X-Accel-Buffering': 'no' });
await this.questionService.execute(dto, user, (chunk) => {
  if (chunk?.content) res.raw.write(chunk.content.toString());
});
```

- `res.hijack()` takes the socket out of Nest's response pipeline so we can `res.raw.write(...)` token-by-token. Do **not** add `return res.send(...)` in this controller — it will throw because the socket is already in raw mode.
- Headers must be written **before** the first `res.raw.write`. If you add an early validation that throws after a chunk is emitted, the client sees partial text followed by the error message — by design (see `catch` block).
- `X-Accel-Buffering: no` defeats nginx/Cloud Run proxy buffering. Don't drop it.

## Attendant flow — src/components/AIChat/Attendant/attendant.service.ts

Same shape as Question, with three deliberate differences:

- **Resolves the agent first, then creates the session under `agent.organization_id`**, not the user's org. A member of org A calling an attendant owned by org B will produce a session billed/scoped to org B. This is intentional for the attendant model (the agent is the "tenant"), so don't "fix" it without a product conversation.
- **No credit check or consumption.** Attendants don't bill.
- **`stream=false`.** `generateAiResponseService.execute(...)` returns the parsed `finalAnswer` string directly (see `AgentFinalResponseSchema` in `[[ai-agent-runtime]]`). The controller does a plain `res.status(200).send(result)`.

The controller's catch block currently returns `error.message` as the body on 500 — when extending, prefer a sanitized message to avoid leaking internals.

## RecordChatMessage — the only internal use case

- `src/components/AIChat/RecordChatMessage/record-chat-message.service.ts` writes to `messages` via `MessageRepository.create({ session_id, user_id, agent_id, from, message })`. `from` is `'user' | 'agent'`. The service catches every error and `console.error`s it; it never throws. Use this everywhere chat history is recorded — do not call `MessageRepository` directly from the orchestrators.
- `RecordChatMessageModule` is imported by `QuestionModule` and `AttendantModule` (not by `AIChatModule`). If you add a third chat entry point, import `RecordChatMessageModule` into that use case's module.

## Dead and orphan modules

- **`AnalyticsAsk/`** — empty placeholder. No files exist. Safe to ignore until a use case is scaffolded here.
- **`ExtractDocumentData/`** — files exist (`controller`, `service`, `dto`, `module`) but `ExtractDocumentDataModule` is **never imported anywhere** (`grep -rn "ExtractDocumentDataModule" src/` returns only the definition). The endpoint will not boot. Do not extend or reference from other code without first wiring it into `AIChatModule` or another live module. If the task is to revive it, also remember to register any new entities and check that the DTO/service compile.

## Common pitfalls

- Adding `await ... .send(...)` or `return res.send(...)` in `QuestionController` after the hijack — breaks streaming with a confusing error.
- Throwing from inside the `for await` loop after some chunks have shipped — partial output is already on the wire; you can only append, not retract. The current code writes a `\n<error message>\n` and ends the stream.
- Recording user message **before** the AI call (which the code does) means a failed AI run still leaves a "user said X" row with no "agent said Y". That's intentional — preserve it so retry/replay logic stays correct.
- Credit consumption only fires after a non-empty `fullResponse`. If you short-circuit the stream source (e.g., add a guard rail that early-returns), make sure you do not also bypass billing for legitimate, partial-but-real responses.
