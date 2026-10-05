# Decisões de domínio registradas fora do código

O código não leva comentários (regra `02`; verificado por `bun run lint:comments`). O que antes vivia em comentário e ainda tem valor está aqui, por área, para que a intenção não se perca. Cada entrada aponta o arquivo dono.

## Agentes e conexões

- **`vector_search_tool` nasce `true`, nunca `null`.** `CreateAgentService` coalesce o campo para o default da coluna. Um `null` faria `ResolveAgentService` pular a tool em silêncio pelos gates de carregamento. (`src/modules/agents/create-agent/create-agent.service.ts`)
- **Quota de agentes vem do plano.** `CreateAgentService.assertWithinAgentQuota` aplica `plans.max_agents`; planos `unlimited` (MAIA playground) e `max_agents = null` são ilimitados. O mesmo vale para `max_users` em `InviteMemberService`.
- **Mover agente de organização é só para `admin` da plataforma.** Membros de organização nunca conseguem tirar um agente da própria organização (`UpdateAgentService`).
- **`is_tool` / `is_principal` na lista de agentes são derivados** da existência de linhas em `agent_connections` e dirigem o gating de "Conversar"/"Conectar" no console (`ListAgentsService`).
- **`agent_connections` é orquestração agente-como-ferramenta.** Liga um agente principal a um filho que ele chama como tool; ambos pertencem à mesma organização; `ResolveAgentService` injeta os filhos **habilitados** no toolset do principal — conexões desabilitadas nunca chegam ao LLM (`AgentConnectionRepository.findEnabledByPrincipalAgentId`). `listViewsByPrincipalAgentId` devolve todas (habilitadas ou não) com o filho carregado, para o canvas.
- **`tool_name` é o nome que o LLM do principal vê** e precisa ser identificador seguro para o provedor (letras, números, hífen, underscore). `tool_description` diz ao LLM quando delegar. `position` é só ordenação visual.
- **`agents.canvas_layout`** é estado puramente visual do canvas de conexões do principal (`{ viewport: { zoom, x, y }, nodes: { [agentId]: { x, y } } }`); os vínculos lógicos vivem em `agent_connections`.
- **Exclusão de conexão:** `admin` da plataforma apaga qualquer organização; os demais só dentro da própria (`DeleteAgentConnectionService`).

## Chat e runtime

- **`conversation_id` manda no `thread_id` do checkpointer.** Quando o cliente envia `conversationId`, ele — e não a sessão — chaveia a memória do agente, então uma conversa nova começa com histórico limpo em vez de retomar a thread da sessão. Sem ele, cai para o `session_id` (`QuestionDto.conversationId`, `CustomMetadata.conversation_id`).
- **`variables` do `/support/question`** aparecem para o agente no bloco VRS do prompt; as chaves controladas pelo servidor (`sessionId`, `conversationId`, `threadId`, `organizationId`) sempre sobrescrevem o que o cliente mandou.
- **Isolamento de tenant no prompt é de código, não de banco.** `BuildSystemPromptService` injeta uma diretriz não negociável sempre que há `companyId`, independente das instruções gravadas para o agente, para que o guardrail não possa ser editado por engano e valha igualmente para o supervisor e para o especialista SQL.
- **Histórico sem `tool_use` órfão.** O `PostgresSaver` do LangGraph grava o estado a cada super-step; se a execução morre entre o passo do modelo (que persiste a mensagem com `tool_calls`) e o passo das tools (que persiste os `ToolMessage`), a thread fica terminando em um `tool_use` sem `tool_result`, e a Anthropic recusa toda chamada seguinte com `400 messages.N: tool_use ids were found without tool_result blocks`. `sanitizeToolCallMessages` remove tool calls sem resultado e resultados sem chamada, em três passagens (ids com resultado → tool calls que sobrevivem → resultados órfãos), descarta turnos de assistente que ficariam vazios e devolve a lista original intacta quando não há nada pendente. Os tipos de bloco considerados `tool_use` acompanham os conversores de `@langchain/anthropic` (`tool_use`, `server_tool_use`, `input_json_delta`, `tool_call`, `server_tool_call`, `tool_call_chunk`).

## Organizações, membros e chaves

- **`api_keys` é a chave S2S da organização**, distinta de `organizations.chat_embed_token` (chave publicável do widget). O segredo completo é devolvido uma única vez na criação; só o SHA-256 (`key_hash`) e um prefixo legível (`sk_live_ab12…`) ficam gravados. `findValidByHash` só devolve chaves não revogadas e não expiradas; `expires_in_days` ausente = chave sem expiração.
- **Convites:** o token bruto vai no link; o SHA-256 fica em `users.invite_token_hash` até o aceite. O envio de e-mail é best-effort — o token também volta na resposta para o owner/admin compartilhar manualmente. `owner` não é atribuível por convite nem por `update-member-role` (transferência de propriedade está fora de escopo).
- **`organization_features.getEnabledFeature`** devolve a linha habilitada com `config` em uma consulta, para o chamador gatear e ler a configuração por organização (ex.: allow-list de tabelas da `database_connection`).
- **Planos:** `max_agents` / `max_users` `null` = ilimitado; `unlimited = true` ignora cobrança de créditos e quotas (MAIA playground); `monthly_credits` é concedido na entrada no plano.

## Relatórios e fontes

- **Filtros de data por dia comparam no bucket `date_trunc('day')::date`** para evitar deriva de fuso (`ReportRepository`). `GET /report/dashboard-data` aceita `created_at` (um dia) ou `start`/`end`.
- **Processamento de fonte nunca rejeita.** `GenerateAgentSourceService.runJob` grava `completed` + contagem de chunks em sucesso e `failed` + mensagem em erro, para que jobs irmãos no mesmo `Promise.all` não sejam afetados.
- **Widget embed:** o script `/public/embed/chat.js` descobre a própria URL base pelo `src` e injeta botão flutuante + iframe.

## Banco de dados

- **Colunas `timestamp` (sem fuso) guardam UTC.** Toda coluna de data do schema é `timestamp without time zone`, e os defaults `now()` são gravados no fuso do Postgres (UTC). `useUtcForTimestampColumns` faz o `pg` enviar parâmetros `Date` e ler essas colunas como UTC, independentemente do fuso do processo Node; sem isso, uma máquina em UTC−3 grava e filtra com 3 h de deriva (ex.: `BETWEEN` do dashboard deixa de achar sessões recém-criadas). Em produção (Cloud Run, UTC) o efeito é nulo. É chamada pela factory do `TypeOrmModule` em `AppModule` e por `data-source.ts`. (`src/infrastructure/database/utc-timestamps.ts`)
