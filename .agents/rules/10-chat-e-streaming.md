---
trigger: glob
description: 'Chat e streaming NDJSON: POST /chat/:agentId, hijack do Fastify, sessões de 8h, gravação de mensagens com embeddings e histórico.'
globs: 'src/modules/chat/**, src/modules/sessions/**'
---

# Chat, streaming e sessões — `src/modules/chat/` e `src/modules/sessions/`

Cobre: o endpoint único de conversação em streaming (`POST /chat/:agentId`), o protocolo NDJSON sobre socket cru do Fastify, o ciclo de vida das sessões de 8 horas e a persistência de mensagens. Detalhes completos estão na skill `fluxo-de-chat`.

## Endpoint único de chat (`POST /chat/:agentId`)

<regras>
- **A rota é `POST /chat/:agentId` (`QuestionController`).** O identificador (`agent_identifier`) ou UUID do agente é recebido como parâmetro de rota `@Param('agentId')`. O `QuestionDto` contém apenas a mensagem (`question`), opções de sessão/conversa (`conversationId`, `variables`) e metadados.
- Exige a permissão `chat.ask`, concedida a todos os papéis (`admin`, `user` e `guest`). Não adicione um segundo endpoint de chat; qualquer evolução do fluxo de conversa estende este endpoint.
- Não há cobrança, verificação de créditos nem trava por tenant no chat; não reintroduza nenhum desses mecanismos sem pedido explícito do solicitante.
</regras>

## Hijack do Fastify e protocolo NDJSON (PC-003)

<regra critica="true">
Após chamar `res.hijack()` no `QuestionController`, escreva exclusivamente com `res.raw.write(...)` e finalize com `res.raw.end()`. O socket está em modo cru: **nunca** chame `res.send(...)` ou `res.status(...)` depois do hijack.
</regra>

<regras>
- Os cabeçalhos HTTP são escritos com `res.raw.writeHead(200, ...)` antes do primeiro chunk:
  - `Content-Type: application/x-ndjson; charset=utf-8`
  - `Cache-Control: no-cache, no-transform`
  - `Connection: keep-alive`
  - `X-Accel-Buffering: no` (obrigatório para impedir que proxies reversos façam buffer dos chunks).
- `QuestionController` é a **única exceção sancionada** à regra "proibido `try/catch` em controllers": como os headers `200` já foram enviados antes da execução do agente, o `GlobalExceptionFilter` não pode transformar uma falha em `ErrorResponse`. O bloco `catch` do controller escreve um evento NDJSON `{ type: 'error', message: '...' }` seguido de `{ type: 'done' }` e encerra o stream (PC-003).
- Cada linha do stream é um JSON válido terminado por `\n` (`step`, `token`, `final`, `error`, `done`).
</regras>

## Sessões e persistência de mensagens

<regras>
- **Sessões com expiração de 8 horas (`CreateSessionIfNotExistsService`):** sessões de conversa expiram após 8 horas de inatividade (`moment().add(8, 'hours')`), sendo renovadas a cada nova mensagem ativa.
- **`thread_id` e variáveis do prompt:** quando o cliente envia `conversationId` (ou `threadId`), ele determina o `thread_id` do LangGraph (`conversationId ?? session.id`). As `variables` enviadas no corpo de `/chat/:agentId` entram no contexto da execução, mas as chaves controladas pelo servidor (`sessionId`, `conversationId`, `threadId`) sempre sobrescrevem qualquer valor de mesmo nome enviado pelo cliente.
- **Persistir a mensagem do usuário ANTES da chamada à IA:** uma execução que falhe na IA deixa intencionalmente a linha "usuário disse X" gravada no banco sem resposta do agente, permitindo auditoria, retentativa e replay.
- **Gravar exclusivamente via `RecordChatMessageService`:** ele gera o embedding da mensagem via `EMBEDDINGS_SERVICE`, grava na tabela `messages` e engole eventuais erros de gravação para que uma falha secundária de persistência ou embedding nunca aborte a conversa em andamento. Nunca chame `MessageRepository` diretamente de fora de `RecordChatMessageService` para gravar turnos de chat.
- **A resposta do agente só é gravada quando o evento `final` produzir texto não vazio:** uma execução vazia ou abortada não grava linha de resposta para o agente.
- **Consulta de histórico (`src/modules/sessions/`):**
  - `GET /conversation/sessions` (`ListSessionsController`, permissão `session.read`): lista sessões paginadas com filtros;
  - `GET /conversation/sessions/:sessionId/messages` (`GetSessionMessagesController`, permissão `session.read`): retorna as mensagens ordenadas da sessão para retomada de conversa no `split-client`.
</regras>
