# Decisões de domínio registradas fora do código

O código não leva comentários (`.claude/rules/conventions.md`; verificado por `bun run lint:comments`). O que antes vivia em comentário e ainda tem valor está aqui, por área, para que a intenção não se perca. Cada entrada aponta o arquivo dono.

## Agentes e conexões

- **`tools` armazena array de identificadores de ferramentas ativas.** `CreateAgentService` padroniza para `['vector_search']` se não informado. O carregamento dinâmico é feito pelo `ToolLoaderService` (`src/modules/tools/tool-loader/tool-loader.service.ts`).
- **Instruções unificadas em `system_prompt`.** A tabela `agents_instructions` e a divisão em `context`, `objetivo` e `diretrizes` foram eliminadas em 2026-10-12 (migration `1759900000000-unify-agent-system-prompt-remove-database.ts`). O prompt agora reside diretamente na coluna `system_prompt` (TEXT) de `agents`.
- **Formato de resposta estruturado em `response_format`.** Configuração de schema/parser unificada na coluna `response_format` (JSONB) de `agents`.
- **Remoção completa do banco externo de clientes.** As colunas `database_tool`, `database_url`, `database_tables`, `database_sample_rows`, a porta `CUSTOMER_DATABASE` e a tool `execute_sql` foram completamente removidas em 2026-10-12.
- **Sem quota e sem dono obrigatório.** Desde a remoção do multi-tenant (2026-10-04) não há limite de agentes; `user_id` registra quem criou, mas qualquer `admin`/`user` lê e altera qualquer agente.
- **Principal é o agente que não é ferramenta de nenhum outro.** `is_tool`, `is_principal` e `has_tools` (em `GET /agent/:id`: `isTool`, `isPrincipal`, `hasTools`) são derivados da existência de linhas em `agent_connections` e dirigem o gating de "Conversar"/"Conectar" no console (`ListAgentsService`, `GetAgentService`): `is_tool` = é filho de alguma conexão; `is_principal` = `!is_tool`, com ou sem ferramentas; `has_tools` = é principal de alguma conexão. A conexão é de um nível só: o filho não pode ter ferramentas (`has_tools`) e quem já é ferramenta não pode ter ferramentas (`CreateAgentConnectionService`).
- **`agent_connections` e canvas visual.** Liga um agente principal a um filho para orquestração visual e hierárquica. `agents.canvas_layout` armazena o estado do canvas (`{ viewport: { zoom, x, y }, nodes: { [agentId]: { x, y } } }`).

## Chat e runtime

- **Chat com `agentId` na rota:** `POST /chat/:agentId` (NDJSON stream). O `agentId` é extraído dos parâmetros de rota `@Param('agentId')`, simplificando o DTO.
- **Sessões com expiração de 8 horas:** Sessões expiram após 8 horas (`moment().add(8, 'hours')`), renovadas a cada conversa ativa.
- **Deep Agents com Store no Supabase (`PostgresStore`):** A execução do agente utiliza `createDeepAgent` (`deepagents`) com VFS e `CompositeBackend` (`StateBackend` efêmero na raiz, `StoreBackend` para `/memories/` e `/skills/` persistidos via `PostgresStore` nos namespaces `['agents', agentId, 'memories']` e `['agents', agentId, 'skills']`).
- **`conversation_id` manda no `thread_id`:** Quando o cliente envia `conversationId`, ele chaveia a memória do agente (`conversation_id ?? session_id`).
- **`variables` do `/chat`** aparecem para o agente no bloco VRS do prompt; as chaves controladas pelo servidor (`sessionId`, `conversationId`, `threadId`) sempre sobrescrevem o que o cliente mandou.
- **Histórico sem `tool_use` órfão.** `sanitizeToolCallMessages` remove tool calls sem resultado e resultados sem chamada para evitar erros da Anthropic quando steps são interrompidos.

## Escopo do produto

- **Motor pessoal, sem tenants.** Organizações, membros e convites, API keys, planos/créditos/Stripe, widget embed, cadastro público, relatórios analíticos (`reports` domain removido) e o token/escopo BravoHub foram removidos. Usuários são criados por um `admin` em `POST /user`; o login é `POST /auth/login`.
- **Sem segunda camada de autorização.** Não há `AccessScopeService`: as permissões por papel (`src/auth/permissions.ts`) bastam porque todo `admin`/`user` age sobre tudo, e `guest` só conversa.

## Fontes de conhecimento e RAG

- **Processamento de fonte roda em segundo plano e nunca rejeita.** `POST /agent/generate-source` responde 202 depois de criar as fontes como `processing`; `GenerateAgentSourceService.runSourceTask` grava `completed` + contagem de chunks em sucesso e `failed` + mensagem em erro, e as tarefas correm soltas num `Promise.allSettled`, sem rejeição não tratada. Fonte removida durante a indexação tem os trechos apagados ao fim da tarefa; fontes que um reinício deixou em `processing` viram `failed` ("Processamento interrompido.") na subida.
- **A busca vetorial filtra só por agente.** `vector_similarity_search` carrega o índice com `{ agent_id }`; o `source_type` dos metadados (`pdf`, `text`, `docx`, `site` ou o `sourceType` enviado) não participa da busca, para que arquivos enviados sem tipo e sites sejam encontrados.

## Banco de dados

- **Colunas `timestamp` (sem fuso) guardam UTC.** Toda coluna de data do schema é `timestamp without time zone`, e os defaults `now()` são gravados no fuso do Postgres (UTC). `useUtcForTimestampColumns` faz o `pg` enviar parâmetros `Date` e ler essas colunas como UTC, independentemente do fuso do processo Node; sem isso, uma máquina em UTC−3 grava e filtra com 3 h de deriva (ex.: `BETWEEN` do dashboard deixa de achar sessões recém-criadas). Em produção (Cloud Run, UTC) o efeito é nulo. É chamada pela factory do `TypeOrmModule` em `AppModule` e por `data-source.ts`. (`src/infrastructure/database/utc-timestamps.ts`)
