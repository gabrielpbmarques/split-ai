---
trigger: always_on
---

# Chat streaming — `src/modules/chat/`

Thin path-scoped reminder. Full detail: the **`ai-chat-flows`** skill. The only chat entry point is `question/` (`POST /chat`, NDJSON stream). It requires `chat.ask`, which every role has, guests included. Do not add a second chat endpoint; extend this one.

<rules>
- **After `res.hijack()` in `QuestionController`, write only with `res.raw.write(...)`.** The socket is in raw mode: never `res.send(...)`. Headers are written before the first chunk; keep `X-Accel-Buffering: no` (defeats proxy buffering). This controller is the sanctioned exception to "no try/catch in controllers": its catch writes an `error` event and then `done` (PC-003).
- **Persist the user message before the AI call.** A failed run intentionally leaves a "user said X" row with no agent reply, for retry and replay. Record only through `RecordChatMessageService` — it swallows errors so a recording failure never aborts the chat; never call `MessageRepository` directly.
- **The agent reply is recorded only when `final` produced text.** An empty or failed run records nothing for the agent.
- There is no billing, credit check or tenant gate on chat anymore; do not reintroduce one without a product decision recorded in `docs/decisoes-de-dominio.md`.
</rules>
