---
name: ai-agent-runtime
description: 'Use for running an agent at request time: ResolveAgent, GenerateAiResponse, deepagents runtime, CompositeBackend, StoreBackend, PostgresStore, streaming, structured responses (AgentFinalResponseSchema), thread memory via thread_id, LangSmith tracing. Scope: src/modules/agents/ + src/modules/agent-runtime/ + src/modules/tools/ + src/modules/store/.'
---

## What a "resolved agent" is

In the `deepagents` runtime, `ResolveAgentService` returns a `DeepAgent & { id: string }`.

## ResolveAgent — src/modules/agent-runtime/resolve-agent/resolve-agent.service.ts

`execute(agentId: string): Promise<DeepAgent & { id: string }>`:

1. **Lookup.** `agentRepository.findByIdOrIdentifier(agentId)` accepts the UUID or the `agent_identifier`. `NotFoundException('Agente não encontrado')` when neither matches.
2. **Store.** `loadStoreService.execute()` loads the `PostgresStore` instance.
3. **Chat model.** `chatModelService.create({ model: agent.model, temperature: agent.temperature })` through the `CHAT_MODEL_SERVICE` provider (`IChatModelService` → `ChatAnthropic` with `env.AI_MODEL` fallback and `ANTHROPIC_BASE_URL`; a fake model in mock mode).
4. **Tools.** `toolLoaderService.execute(agent)` resolves enabled tools from `agent.tools` (`'vector_search'`, etc.).
5. **Agent assembly.** `createDeepAgent` from `deepagents` with:
   - `model`: chat model instance
   - `tools`: resolved tools
   - `memory`: `['/memories/sherlock/AGENTS.md', '/scratchpad/notes.md', '/memories/']`
   - `skills`: `['/skills/']`
   - `store`: `PostgresStore`
   - `backend`: `CompositeBackend` mounting `StateBackend` (ephemeral) at root, `StoreBackend({ namespace: ['agents', agent.id, 'memories'] })` at `/memories/`, and `StoreBackend({ namespace: ['agents', agent.id, 'skills'] })` at `/skills/`.
6. Returns the instantiated `DeepAgent` with `id: agent.id`.

## LoadStoreService — src/modules/store/load-store/load-store.service.ts

- Shared `PostgresStore` per process (`static`), connected via `env.DATABASE_URL`.
- Calls `.setup()` on module initialization to ensure the `store` table exists.
- Provides persistent memory storage for the agent's `/memories/` and `/skills/` namespaces.

## GenerateAiResponse — src/modules/agent-runtime/generate-ai-response/generate-ai-response.service.ts

`execute(question, metadata: CustomMetadata, agent: DeepAgent, stream = false)` returns `string` or `AsyncGenerator<StreamEvent>`.

### Invocation config

```ts
const threadKey = metadata.conversation_id ?? metadata.session_id;
const configurable: RunnableConfig = {
  configurable: { thread_id: threadKey },
  callbacks: this.tracers,
  metadata: {
    userId: metadata.user_id,
    sessionId: metadata.session_id,
    environment: env.NODE_ENV,
  },
};
```

- **`thread_id` is `conversation_id ?? session_id`.** It binds a conversation to its checkpointer/history thread.
- LangSmith tracing is on whenever `INTEGRATION_MODE` is not `mock` (`new LangChainTracer({ projectName: env.LANGCHAIN_PROJECT })`); tests run without a tracer.

### Non-stream path

`agent.invoke({ messages: [new HumanMessage(question)] }, configurable)`, then `AgentFinalResponseSchema.safeParse(result.structuredResponse)`; returns `finalAnswer`, or the text of the last message (`textOf((result?.messages?.at(-1) as AIMessage)?.content)`) when structured response is missing.

### Stream path

`agent.stream({ messages: [new HumanMessage(question)] }, { ...configurable, streamMode: 'updates' })` is consumed by `handleStreamResponse` (`src/shared/utils/handle-stream-response.ts`), which yields `StreamEvent`s:

- `status` (`tool_call` / `tool_result`) for real tools.
- `final` from `structuredResponse.finalAnswer` (or fallback to tool call `finalAnswer` or last model text).
- `error` when an execution failure occurs.
- `done` always, last.

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

Only `finalAnswer` is load-bearing.

## Common pitfalls

- **No model configured.** `agent.model = null` and no `AI_MODEL` → `CHAT_MODEL_SERVICE` is `NOT_CONFIGURED` and `create()` throws 503.
- **`agent.stream` resolves to an `AsyncIterable`.** Await the call, then iterate the items.
- **Memory continuity depends on a stable thread_id.** A client-sent `conversationId` / `threadId` overrides the session default.
