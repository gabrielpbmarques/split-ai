---
name: ai-agent-runtime
description: 'Use for running an agent at request time: ResolveAgent, GenerateAiResponse, LangGraph streaming, structured responses (AgentFinalResponseSchema), thread_id memory via PostgresSaver, LangSmith tracing. Also for debugging empty replies or lost memory. Scope: src/modules/agents/ + src/modules/agent-runtime/ + src/modules/retrieval/.'
---

## What a "resolved agent" is

`ResolvedAgent` (`src/shared/contracts/models/resolved-agent.model.ts`) is the in-memory bundle every chat use case operates on:

```ts
interface ResolvedAgent {
  id: string;
  systemPrompt: string; // rendered prompt, ends with TODAY_DATE
  chat: BaseChatModel; // from the CHAT_MODEL port
  runnableOpts: RunnableChatOpts; // { withHistory }
  tools?: AgentTool[];
  sites?: string[];
  runnable: AgentRunnable; // ReturnType<typeof createAgent> from 'langchain'
}
```

`runnable` is the only field invoked at chat time; the rest is metadata.

## ResolveAgent — src/modules/agent-runtime/resolve-agent/resolve-agent.service.ts

`execute(agentId, promptVariables?, memorySaver?, connectionContext?)`:

1. **Lookup.** `agentRepository.findByIdOrIdentifier(agentId)` accepts the UUID or the `agent_identifier`. `NotFoundException('Agente não encontrado')` when neither matches.
2. **Latest instructions.** `agentInstructionRepository.findLatestByAgentId(agent.id)`; `NotFoundException('Agente sem instruções configuradas')` when there is none.
3. **Chat model.** `chatModelFactory.create({ model: agent.model, temperature: agent.temperature })` through the `CHAT_MODEL` port (`AnthropicChatModelFactory` → `ChatAnthropic` with `env.AI_MODEL` fallback and `ANTHROPIC_BASE_URL`; a fake model in mock mode).
4. **Tools.** `loadAgentToolsService.execute(agent, connectionContext)` assembles parser, vector search, `execute_sql` and agent-connection tools from per-agent flags (`[[ai-agent-tools-and-rag]]`).
5. **System prompt.** `buildSystemPromptService.execute(instructions, tools, promptVariables)`. Variables are rendered in the `VRS` block. Question passes `{ ...dto.variables, sessionId, conversationId, threadId }`.
6. **Checkpointer.** Only when `agent.with_history` is true **and** the agent is not a delegated child (`connectionContext.depth > 0`). A caller-supplied `MemorySaver` wins; otherwise `loadCheckpointerService.execute()` returns the shared `PostgresSaver`. Children never get one: the top-level `@langchain/langgraph@0.x` `MemorySaver` crashes on checkpoints written by `langchain@1.x`.
7. **Runnable.** `createAgent({ model, tools, systemPrompt, checkpointer, middleware: [sanitizeHistoryMiddleware], responseFormat: AgentFinalResponseSchema })`. The middleware runs `sanitizeToolCallMessages` before every model call so a thread with a dangling `tool_use` keeps working.

## LoadCheckpointer — src/modules/agent-runtime/load-checkpointer/load-checkpointer.service.ts

- One shared `PostgresSaver` per process (`static`), built from `env.DATABASE_URL`, `setup()` on module init (creates the checkpoint tables if absent) and closed on shutdown.
- Same Postgres as TypeORM. The `checkpoint*` tables belong to the library: never drop, rename or map them as entities.
- `bun run repair:thread <threadId>` deletes a poisoned thread by hand.

## GenerateAiResponse — src/modules/agent-runtime/generate-ai-response/generate-ai-response.service.ts

`execute(question, metadata: CustomMetadata, agent: ResolvedAgent, stream = false)` returns `string` or `AsyncGenerator<StreamEvent>`.

### Invocation config

```ts
const threadKey = metadata.conversation_id ?? metadata.session_id;
const configurable: RunnableConfig = {
  configurable: { thread_id: threadKey },
  callbacks: this.tracers,
  tags: [env.NODE_ENV, agent.id],
  metadata: { userId, sessionId, environment: env.NODE_ENV },
};
```

- **`thread_id` is `conversationId ?? session.id`.** It binds a conversation to its checkpointer history; changing the format detaches every stored thread. (It used to be prefixed by the organization id; migration `RemoveMultiTenancy1759700000000` stripped that prefix from the checkpoint tables.) Delegated children use `conn_<childAgentId>`.
- LangSmith tracing is on whenever `INTEGRATION_MODE` is not `mock` (`new LangChainTracer({ projectName: env.LANGCHAIN_PROJECT })`); tests run without a tracer.

### Non-stream path

`runnable.invoke(...)`, then `AgentFinalResponseSchema.safeParse(result.structuredResponse)`; returns `finalAnswer`, or the text of the last message when the structured response is missing.

### Stream path

`runnable.stream(invokeParams, { ...configurable, streamMode: 'updates' })` is consumed by `handleStreamResponse` (`src/shared/utils/handle-stream-response.ts`), which yields `StreamEvent`s:

- `status` (`tool_call` / `tool_result`) for real tools; the internal structured-output tool (`extract-N`) is hidden.
- `final` from `structuredResponse.finalAnswer`; if that never fires, it falls back to the raw `finalAnswer` captured from the structured-output tool call, then to the last model text.
- `error` when the graph throws (recursion limit gets a friendlier message) or nothing usable was produced.
- `done` always, last.

There are no token deltas: the client sees status chips and then the whole answer. To surface something new, add a branch; do not break the `final` path.

### The error swallow

The whole method is wrapped in `try/catch`: any exception becomes `'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?'` (as a string, or as an `error` + `done` stream via `errorStream`). Callers never see stack traces; observe failures through LangSmith and Sentry.

## AgentFinalResponseSchema — src/shared/contracts/agent-response.ts

```ts
z.object({
  finalAnswer: z.string(),
  confidence: z.number().min(0).max(1).optional().catch(undefined),
  needsClarification: z.boolean().optional().catch(undefined),
  sources: z.array(z.string()).optional().catch(undefined),
  toolCallsUsed: z.array(z.string()).optional().catch(undefined),
});
```

Only `finalAnswer` is load-bearing. The optional fields use `.catch(undefined)` because some models emit them with the wrong JSON type (`"0.9"` as a string); a plain `.optional()` would reject the whole structured response and leave the chat bubble blank.

## Common pitfalls

- **No model configured.** `agent.model = null` and no `AI_MODEL` → the `CHAT_MODEL` port is `NOT_CONFIGURED` and `create()` throws 503.
- **`runnable.stream` resolves to an `AsyncIterable`.** Await the call, then iterate the items.
- **Memory continuity depends on a stable key.** `CreateSessionIfNotExists` reuses the active session per user+agent; a client-sent `conversationId` overrides it and starts a clean thread.
- **Streaming relies on `responseFormat`.** Without it there is no `structuredResponse`, and the stream falls back to the last model text.
- **No token accounting.** Billing and the `token_usage` table were removed; usage is visible only in LangSmith.
