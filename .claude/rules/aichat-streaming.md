---
paths:
  - 'src/components/AIChat/**/*.ts'
---

# Scoped rule — `src/components/AIChat/`

Thin path-scoped reminder. Full detail: the **`ai-chat-flows`** skill. Live entry points only: `Question/` (`POST /support/question`, streams) and `Attendant/` (`POST /chat/attendant`, non-stream); both wired in `ai-chat.module.ts`.

Must-not-break invariants:

- **Don't `res.send(...)` / `return res.send(...)` after `res.hijack()`** in `QuestionController` — the socket is in raw mode; only `res.raw.write(...)`. Headers are written **before** the first chunk. Keep `X-Accel-Buffering: no` (defeats proxy buffering). This is the sanctioned exception to root Hard rule 3's `res.send` catch pattern — a hijacked controller must fall back to `res.raw.write` in its catch.
- **Billing properties to preserve:** a request is billable only when `user.organization_id` is set **and** `user.role !== 'service'` **and** the org's plan is not `unlimited` (S2S API-key callers carry `role: 'service'` and skip billing; `unlimited` plans skip billing regardless of role). Credit is consumed **only after a non-empty `fullResponse`** — a failed/empty agent run never bills. Don't break any of these when refactoring the stream loop.
- **Persist the user message before the AI call** (a failed run intentionally leaves a "user said X" row with no agent reply — keep it for retry/replay). Record via `RecordChatMessageService` only — never call `MessageRepository` directly; it swallows errors and never throws, so recording failures must not abort the chat.
- **Attendant differs on purpose:** it resolves the agent first and scopes the session to `agent.organization_id` (not the caller's org), does **no** credit check, and returns the parsed `finalAnswer` string (`stream=false`). Don't "fix" the cross-org scoping without a product call.
- **Dead/orphan modules:** `AnalyticsAsk/` is an empty placeholder; `ExtractDocumentData/` exists but its module is never imported (won't boot). Wire into a live module before extending.
