---
name: fluxo-de-chat
description: 'Orquestração de chat e streaming: POST /chat/:agentId com stream NDJSON, hijack de resposta no Fastify, sessões de conversa de 8h e persistência de mensagens com embeddings.'
---

# Fluxo de chat e streaming (`src/modules/chat/` e `src/modules/sessions/`)

Cobre: o endpoint único de chat (`POST /chat/:agentId`), o sequestro do socket no Fastify (`res.hijack()`) para streaming NDJSON, o gerenciamento de sessões de 8 horas e a gravação resiliente de mensagens. Regras base em `.agents/rules/10-chat-e-streaming.md`.

## Escopo

`ChatModule` (`src/modules/chat/chat.module.ts`) agrega `QuestionModule` e o módulo auxiliar `RecordChatMessageModule`. `QuestionController` é a única porta de entrada de chat da API; estenda-o em vez de criar outro endpoint. Não há cobrança, verificação de créditos nem trava de tenant no chat.

## Endpoint ativo

<tabela>

| Rota                  | Caso de uso | Streaming?                  | Permissão  | DTO           |
| --------------------- | ----------- | --------------------------- | ---------- | ------------- |
| `POST /chat/:agentId` | `question`  | Sim (`res.hijack()` NDJSON) | `chat.ask` | `QuestionDto` |

</tabela>

- `agentId` vem do parâmetro de rota (`@Param('agentId')`). Aceita tanto o UUID quanto o `agent_identifier`.
- `chat.ask` é concedida a todos os papéis (`admin`, `user` e `guest`).
- `QuestionDto`: `{ question: string, conversationId?: string, threadId?: string, variables?: Record<string, unknown> }`.

## Fluxo do `QuestionService` — `src/modules/chat/question/question.service.ts`

1. **Sessão (`CreateSessionIfNotExistsService`):** reutiliza a sessão informada (`conversationId` / `threadId`) ou busca/cria uma sessão ativa do usuário para aquele agente (válida por **8 horas**, renovada a cada interação).
2. **Resolução do agente (`ResolveAgentService`):** instancia o `DeepAgent` com `PostgresStore`, `PostgresSaver`, system prompt, memórias, skills e ferramentas (ver skill `execucao-de-agentes`).
3. **Gravação da mensagem do usuário (`RecordChatMessageService`):** executada **antes** da chamada ao modelo de IA (`sender: 'user'`). Se a IA falhar, a pergunta do usuário permanece registrada para histórico e retentativa.
4. **Geração em streaming (`GenerateAiResponseService`):** invocada com `stream = true` e `thread_id = conversationId ?? session.id`, retornando um `AsyncGenerator<StreamEvent>`.
5. **Loop de eventos:** cada `StreamEvent` é repassado para o callback `onEvent` do controller; o texto do evento `final` é capturado.
6. **Gravação da resposta do agente (`RecordChatMessageService`):** executada **somente** quando o evento `final` produziu texto não vazio (`sender: 'agent'`).

## Hijack da resposta no Fastify — `src/modules/chat/question/question.controller.ts`

```ts
res.hijack();
res.raw.writeHead(200, {
  'Content-Type': 'application/x-ndjson; charset=utf-8',
  'Transfer-Encoding': 'chunked',
  'Cache-Control': 'no-store',
  'X-Accel-Buffering': 'no',
});
const writeEvent = (event: StreamEvent): void => {
  res.raw.write(`${JSON.stringify(event)}\n`);
};
```

- O socket é sequestrado (`res.hijack()`) para envio de NDJSON cru em chunks.
- `X-Accel-Buffering: no` impede que proxies reversos acumulem os chunks antes de enviá-los ao cliente.
- Como os cabeçalhos HTTP `200` já foram enviados antes do início da geração, o `GlobalExceptionFilter` não atua sobre esta rota. Por isso, `QuestionController` mantém o único `try/catch` permitido em controllers do projeto, escrevendo `{ type: 'error', ... }` seguido de `{ type: 'done' }` antes de `res.raw.end()` (PC-003).

## `RecordChatMessageService` — `src/modules/chat/record-chat-message/record-chat-message.service.ts`

- Gera o embedding do texto via `EMBEDDINGS_SERVICE` (`voyage-3-large`) e grava a linha na tabela `messages` via `MessageRepository`.
- Qualquer erro durante a geração do embedding ou inserção no banco é capturado e registrado no logger (`warn`/`error`), nunca propagando exceção para não interromper a conversa do usuário.

## Histórico de sessões (`src/modules/sessions/`)

- `GET /conversation/sessions` (`ListSessionsController`, permissão `session.read`): lista paginada de sessões de conversa.
- `GET /conversation/sessions/:sessionId/messages` (`GetSessionMessagesController`, permissão `session.read`): retorna as mensagens da sessão em ordem cronológica, consumida pelo `split-client` ao retomar uma conversa (`/?agente=<agentId>&sessao=<sessionId>`).
