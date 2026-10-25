---
description: 'CRUD e configuração de agentes de IA: criar/atualizar/listar/obter agentes, system_prompt, array tools, response_format, conexões entre agentes (agent_connections), canvas_layout e grafo de conhecimento (GET /agent/:id/knowledge-graph).'
---

# Configuração e CRUD de agentes de IA

Cobre: a tabela `agents` e `agent_connections`, os endpoints de `src/modules/agents/` e `src/modules/agent-connections/`, a busca por chave dupla (UUID ou `agent_identifier`), o cálculo dos papéis `is_tool`/`is_principal`/`has_tools` e a construção do grafo de conhecimento do agente. Regras base em `.agents/rules/08-agentes-de-ia.md`.

## Estrutura de persistência (`AgentEntity` e `AgentConnectionEntity`)

Gerenciadas pelo TypeORM + migrations (`synchronize: false`; ver `.agents/rules/04-banco-de-dados.md`).

### Tabela `agents` (`src/infrastructure/database/schema/agent.entity.ts`)

<tabela>

| Coluna             | Tipo                   | Observações                                                                                                                                     |
| ------------------ | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`               | `uuid`                 | Chave primária                                                                                                                                  |
| `name`             | `text not null`        | Nome de exibição do agente                                                                                                                      |
| `agent_identifier` | `text nullable`        | Identificador legível (ex.: `'sherlock'`), aceito onde quer que o `id` seja aceito (dual-key lookup)                                            |
| `model`            | `text nullable`        | Modelo do LLM (`CreateAgentService` define `'deepseek-flash'` por padrão; no runtime faz fallback para `'deepseek-chat-v3.2'` / `env.AI_MODEL`) |
| `temperature`      | `float default 0.4`    | Temperatura de geração                                                                                                                          |
| `with_history`     | `boolean default true` | Controla uso de histórico de sessão / checkpointer                                                                                              |
| `system_prompt`    | `text not null`        | Instruções completas do agente em Markdown (substituiu a antiga tabela `agents_instructions`)                                                   |
| `tools`            | `text[] not null`      | Identificadores das ferramentas ativas (ex.: `['vector_search', 'tavily_search']`)                                                              |
| `response_format`  | `jsonb nullable`       | Definição opcional de JSON Schema para saída estruturada                                                                                        |
| `sites`            | `text[] nullable`      | URLs semente configuradas no agente                                                                                                             |
| `canvas_layout`    | `jsonb nullable`       | Estado visual do canvas de conexões (`viewport` e coordenadas `nodes`)                                                                          |
| `user_id`          | `uuid nullable`        | Quem criou o agente; apenas informativo, não restringe acesso                                                                                   |

</tabela>

Não há escopo de organização ou restrição de propriedade: qualquer usuário `admin` ou `user` lê e edita qualquer agente (`.agents/rules/06-autenticacao-e-autorizacao.md`). As antigas colunas de banco externo (`database_tool`, `database_url`, `database_tables`, `database_sample_rows`) foram removidas.

## Casos de uso de `src/modules/agents/`

<tabela>

| Rota                             | Caso de uso            | Permissão      | Observações                                                                           |
| -------------------------------- | ---------------------- | -------------- | ------------------------------------------------------------------------------------- |
| `POST /agent/create`             | `create-agent`         | `agent.write`  | Cria o agente diretamente via `AgentRepository.create`                                |
| `GET /agent/list`                | `list-agents`          | `agent.read`   | Lista paginada com `{ id, agent_identifier, name, is_tool, is_principal, has_tools }` |
| `GET /agent`                     | `list-all-agents`      | `agent.manage` | Lista paginada administrativa                                                         |
| `GET /agent/:id`                 | `get-agent`            | `agent.read`   | Aceita UUID ou `agent_identifier`; retorna `AgentDetails` com conexões e flags        |
| `GET /agent/:id/knowledge-graph` | `get-knowledge-graph`  | `agent.read`   | Retorna `{ nodes, edges, stats }` combinando agente, tools, memórias, skills e fontes |
| `PATCH /agent/:id`               | `update-agent`         | `agent.write`  | Atualização parcial via `AgentRepository.update` (aceita UUID ou `agent_identifier`)  |
| `PATCH /agent/:id/canvas-layout` | `update-canvas-layout` | `agent.write`  | Atualiza o layout visual `canvas_layout` do agente                                    |

</tabela>

Cada rota possui seu próprio módulo de caso de uso (um controller com `handle()`, um service com `execute()`).

## Busca por chave dupla (`findByIdOrIdentifier`)

`AgentRepository.findByIdOrIdentifier(idOrIdentifier)` verifica primeiro se a string é um UUID válido (`isUuid`); se for, busca por `id`; se não encontrar ou não for UUID, busca por `agent_identifier`. Sempre utilize esse método do repositório em vez de criar buscas privadas nos services.

## Conexões entre agentes (`src/modules/agent-connections/`)

- `POST /agent-connection/create` (`agent-connection.manage`): conecta um agente principal (`agent_id`) a um subagente (`connected_agent_id`) que atuará como ferramenta dele.
- `GET /agent-connection/by-agent/:agentId` (`agent.read`): lista as conexões do agente.
- `DELETE /agent-connection/:id` (`agent-connection.manage`): remove (soft delete) a conexão.
- **Regras de hierarquia (1 nível):**
  - `is_tool`: o agente aparece como `connected_agent_id` em alguma conexão ativa;
  - `is_principal`: `!is_tool`;
  - `has_tools`: o agente aparece como `agent_id` em alguma conexão ativa.
  - Um subagente (`is_tool`) não pode ter subagentes, e um agente que já possui subagentes (`has_tools`) não pode virar subagente de outro.

## Grafo de conhecimento (`GetKnowledgeGraphService`)

`GET /agent/:id/knowledge-graph` resolve o agente por UUID ou `agent_identifier` e executa `LoadStoreService` + buscas no `PostgresStore` (`['memories', agent.id, 'filesystem']` e `['skills', agent.id, 'filesystem']`) + `SourceRepository.listByAgent(agent.id)` em paralelo (`Promise.all`). Ele monta:

- Nós (`KnowledgeGraphNode`): o agente central (`agent`), ferramentas ativas (`tool`), arquivos de memória (`memory`), arquivos de skill (`skill`) e fontes indexadas (`source`).
- Arestas (`KnowledgeGraphEdge`): ligações diretas do agente para cada recurso e arestas implícitas quando o texto de uma memória ou skill referencia o nome ou caminho de outro nó.

## Armadilhas comuns

- Adicionar uma nova coluna em `AgentEntity` não a inclui automaticamente na resposta de `GET /agent/:id` ou `GET /agent/list`: atualize as projeções (`SELECT`) e o objeto `AgentDetails` em `GetAgentService` / `ListAgentsService` (e o contrato correspondente em `../split-client/shared/contracts/`).
- Nunca reintroduza `agents_instructions` ou `AIInstructions`: o prompt de sistema vive inteiramente em `AgentEntity.system_prompt` (ou em `memories/<agent_identifier>/AGENT.md` quando versionado em disco).
