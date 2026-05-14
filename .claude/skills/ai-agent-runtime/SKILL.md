---
name: ai-agent-runtime
description: 'Use when: invoking or modifying how an agent runs at request time — ResolveAgent, GenerateAIResponse, LangGraph streaming, structured responses, conversation memory via thread_id, the PostgreSQL checkpointer, or LangSmith tracing. Use also when debugging why an agent reply is empty, why memory does not persist, or where token-usage rows come from.'
---

## What a "resolved agent" is

`ResolvedAgent` (`src/types/models/resolved-agent.model.ts`) is the in-memory bundle every chat use case operates on:

```ts
interface ResolvedAgent {
  id?: string;
  systemPrompt: string; // already-rendered prompt with TODAY_DATE
  chat: ChatVertexAI; // model instance
  runnableOpts: { withHistory };
  tools?: DynamicStructuredTool<z.ZodObject<any>>[];
  sites?: string[];
  organization_id?: string;
  runnable: AgentRunnable; // ReturnType<typeof createAgent> from 'langchain'
}
```

`runnable` is the only field invoked at chat time. The rest is metadata.

## ResolveAgent — src/components/ArtificialIntelligence/ResolveAgent/resolve-agent.service.ts

Single public method `execute(agentId, promptVariables?, memorySaver?)`:

1. **Lookup.** `agentRepository.findOne({ where: [{ id: agentId }, { agent_identifier: agentId }] })` — accepts either the UUID or the human-readable identifier in the same field. Throws `'Agent não encontrado'` if neither matches.
2. **Latest instructions.** `agentInstructionRepository.findLatestByAgentId(agent.id)` — instructions are versioned in `agents_instructions`; the latest row wins.
3. **Parallel load** of chat model and tools via `Promise.all([loadChat(agent), loadTools(agent)])`.
   - `loadChat` returns `new ChatVertexAI({ model: agent.model || config.aiModel, temperature: agent.temperature ?? 0.4, safetySettings: [...BLOCK_ONLY_HIGH...] })`. Safety settings are hard-coded — don't bury new categories silently.
   - `loadTools` is gated by per-agent flags (see `[[ai-agent-tools-and-rag]]`).
4. **System prompt.** `buildSystemPromptService.execute(latestInstructions?.instructions, tools, { ...promptVariables, organizationId: agent.organization_id })` — `organizationId` is always merged in, so prompt templates can reference it.
5. **Checkpointer.** Only created when `agent.with_history` is `true`. Caller can inject an in-memory `MemorySaver`; otherwise `loadCheckpointerService.execute()` returns the singleton `PostgresSaver`.
6. **Runnable.** `createAgent({ model, tools, systemPrompt, checkpointer, responseFormat: AgentFinalResponseSchema })` from `langchain` (v1 React-style agent). `model: chat as any` is needed because Vertex's typing isn't fully compatible with the `createAgent` generic.

`promptVariables` is forwarded raw to the prompt — at minimum the chat flows pass `{ sessionId }` (from Question) or `{ agentId, userName, userPhone, userId }` (from Attendant). Add new variables here when prompt templates need them.

## LoadCheckpointer — src/components/ArtificialIntelligence/LoadCheckpointer/load-checkpointer.service.ts

```ts
@Injectable()
export class LoadCheckpointerService implements OnModuleInit {
  private static saver: PostgresSaver;
  async onModuleInit() {
    if (!LoadCheckpointerService.saver) {
      LoadCheckpointerService.saver = PostgresSaver.fromConnString(DB_URI);
      await LoadCheckpointerService.saver.setup();
    }
  }
  execute(): PostgresSaver {
    return LoadCheckpointerService.saver;
  }
}
```

- **One shared saver per process** (`static`), built from `config.databaseUrl` and `setup()`-ed once on module init. `setup()` creates the LangGraph checkpoint tables in Postgres if absent.
- The saver is the **same** Supabase Postgres instance as TypeORM. Tables live alongside your entities. Don't accidentally drop or rename them in migrations.
- Caller-supplied `MemorySaver` (in-memory) is used in places that need transient memory (e.g., one-shot tool invocations) — pass it explicitly to `resolveAgentService.execute(..., memorySaver)`.

## GenerateAIResponse — src/components/ArtificialIntelligence/GenerateAIResponse/generate-ai-response.service.ts

```ts
execute(question, metadata: CustomMetadata, agent: ResolvedAgent, stream: boolean = false)
```

### Invocation config (lines 55-70)

```ts
const invokeParams = { messages: [new HumanMessage(question)] } as any;
const configurable = {
  configurable: {
    thread_id: `${agent.organization_id}_${metadata.session_id}`,
  },
  callbacks: [this.tracer], // LangSmith
  tags: [config.env, agent.id, metadata.organization_id],
  metadata: { userId, sessionId, environment: config.env },
};
```

- **`thread_id` format is `${organization_id}_${session_id}`.** This is what binds a conversation's history together in the checkpointer. Change the format only if you migrate stored threads — otherwise existing sessions detach from their memory.
- LangSmith tracing is **always on** (constructor: `new LangChainTracer({ projectName: config.langchainProject })`). Make sure `LANGSMITH_*` env vars are set in any new environment.
- The `as any` on `invokeParams` is intentional — `createAgent`'s inferred input type is overly strict; the runtime accepts `{ messages: BaseMessage[] }`.

### Non-stream path (lines 80-101)

`runnable.invoke(invokeParams, configurable)` → `result.messages.at(-1).usage_metadata` → call `recordTokenUsageService.execute({...})` with `model: (agent.chat as any).model`. Then `AgentFinalResponseSchema.parse(result.structuredResponse).finalAnswer` is returned as a plain string. **Parsing will throw** if the model returns an off-schema response — see `AgentFinalResponseSchema` in `src/types/agent-response.ts`.

### Stream path (lines 72-78, handler at 104-129)

`runnable.stream(invokeParams, { ...configurable, streamMode: 'updates' })` yields chunks classified by key:

- `chunk.agent?.messages[0]` → has `usage_metadata` → record token usage (fires once per agent step).
- `chunk.model?.structuredResponse` → yield `chunk.model.structuredResponse.finalAnswer` upstream.
- Anything else (`tools`, `model` without structured response, etc.) is **silently dropped**.

So a streamed reply only emits final-answer prose; intermediate tool reasoning is never shown to the user. If you need tool-call surfacing, add a new branch — don't break the existing two.

### The error swallow (lines 40-43)

`generateResponse` is wrapped in a `try { ... } catch { return 'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?'; }`. **All exceptions become this pt-BR string.** That means:

- Upstream callers never see stack traces from inside the model run. Log/observe via LangSmith and Sentry, not via thrown errors.
- If you want a hard failure mode (e.g., to skip credit consumption on certain errors), you must surface it through a different channel — the current contract is "always returns a value".

## AgentFinalResponseSchema — src/types/agent-response.ts

```ts
z.object({
  finalAnswer: z.string().describe('Resposta final e completa para o usuário'),
  confidence: z.number().min(0).max(1).optional(),
  needsClarification: z.boolean().optional(),
  sources: z.array(z.string()).optional(),
  toolCallsUsed: z.array(z.string()).optional(),
});
```

Only `finalAnswer` is wired through to chat callers today. The other fields are reserved for future UX and **are not** logged or persisted automatically — add explicit handling if you start using them.

## Token usage

`RecordTokenUsageService` (in `src/components/TokenUsage/RecordTokenUsage/`) is called on every successful response with `{ organization_id, agent_id, user_id, input_tokens, output_tokens, total_tokens, model }`. It writes to the `token_usage` table. It is only invoked when `agent.organization_id` is truthy — admin/global agents (with `organization_id = null`) do not produce usage rows.

## Common pitfalls

- **Empty `chat.model`.** `model: (agent.chat as any).model` reads back the model name. If the agent record has `model = null` and `config.aiModel` is unset, the recorded row gets `'unknown'`.
- **`runnable.stream` returns an `AsyncIterable`, not a `Promise`.** Don't `await` the iterator itself — only the items.
- **Memory continuity depends on a stable `session_id`.** `createSessionIfNotExists` is responsible for that; if you bypass it, each request gets a fresh thread.
- **Streaming and `responseFormat` coexist.** The graph still emits a final structured chunk at the end (the `chunk.model.structuredResponse` branch). If you stop using `responseFormat`, the stream handler will yield nothing for the final answer.
