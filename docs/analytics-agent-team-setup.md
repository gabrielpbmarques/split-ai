# Runbook — Time de Analytics (Supervisor + Especialistas)

Decompõe o agente monolítico de analytics **`a951e928-2b86-4737-8aee-88fde5eb27d6`** numa "pequena empresa de analytics" usando a feature de **agent-connections** (sub-agente-como-ferramenta) já existente no projeto.

**Opção escolhida: A — 3 agentes** (Supervisor + Analista de Dados SQL + Narrador). Máximo isolamento de contexto com mínima latência/custo.

> **Pré-requisito de código já aplicado neste repo:** `CreateAgentDto`/`UpdateAgentDto` + services agora expõem `databaseTool` / `vectorSearchTool`. Sem isso, o Narrador nasceria com `database_tool=true` (default da coluna) e carregaria o schema, derrotando o isolamento.

Todas as chamadas: `Authorization: Bearer <jwt admin|user>`. Sem prefixo `/api`.

---

## Por que o time tem esta forma (restrições do runtime)

- **Bipartido, 2 camadas.** `MAX_AGENT_CONNECTION_DEPTH=1` + os guards em `CreateAgentConnectionService` ⇒ supervisor → folhas; nenhum filho pode ter filhos.
- **Filhos stateless e isolados.** Cada filho só vê a _string_ `input` que o supervisor passa e devolve só `finalAnswer`. O **supervisor é a única memória** e repassa artefatos.
- **`execute_sql` embute o schema COMPLETO** no prompt de quem tem `database_tool=true`. Por isso **só o Analista SQL** carrega o banco; o supervisor não.
- **Isolamento vem de `withHistory=false`** nos filhos (faz o checkpointer ficar `undefined`), não do `MemorySaver` efêmero.

---

## Passo 0 — Inspecionar e guardar o estado atual (rollback)

```
GET /agent/a951e928-2b86-4737-8aee-88fde5eb27d6
```

Anote `model`, `withHistory`, `parser` e **as `instructions` atuais**. O PATCH do Passo 4 preserva o `id` e o histórico, mas **sobrescreve as instruções** — guarde-as para reverter.

---

## Passo 1 — Criar o filho "Analista de Dados SQL"

```
POST /agent/create
```

```json
{
  "name": "Analista de Dados SQL",
  "agentIdentifier": "analytics-sql-analyst",
  "model": "claude-sonnet-4-6",
  "temperature": 0.1,
  "withHistory": false,
  "databaseTool": true,
  "vectorSearchTool": false,
  "instructions": {
    "objetivo": "Receber uma descrição em linguagem natural da informação desejada, interpretar contra o schema completo do banco, escolher tabelas/colunas, escrever UMA query SQL SELECT segura, executar via execute_sql e retornar os DADOS BRUTOS estruturados. Você é o único agente que enxerga o schema e fala com o banco.",
    "context": "Você é um Analista de Dados sênior. A ferramenta execute_sql traz o ESQUEMA COMPLETO do banco embutido no seu prompt — use só o que está listado, nunca invente tabelas/colunas. Você é stateless; recebe só a tarefa escrita pelo Gerente, sem histórico. Sua resposta volta para o Gerente, não para o usuário final: entregue dados estruturados e fiéis, sem narrativa de negócio.",
    "diretrizes": [
      "Antes de escrever a query, identifique no schema embutido em execute_sql quais tabelas/colunas respondem à tarefa.",
      "Escreva UMA query, e ela DEVE ser um SELECT puro — embora a ferramenta tecnicamente aceite INSERT/UPDATE, NUNCA gere comandos de escrita. Liste colunas explicitamente (sem SELECT *).",
      "Respeite as REGRAS DE OURO da ferramenta: uma só statement; sem DELETE/ALTER/DROP/CREATE/REPLACE/TRUNCATE; se não puser LIMIT, um LIMIT 5 é aplicado — ponha LIMIT explícito quando precisar de mais linhas (ex.: LIMIT 100).",
      "Em erro do banco, leia a mensagem, corrija a query e tente de novo (até 3 tentativas).",
      "finalAnswer = dados brutos compactos (colunas + linhas, ex.: tabela markdown) + a query SQL executada, em uma linha, para rastreabilidade. NÃO escreva análise/narrativa de negócio.",
      "Se a query retornar vazio/insuficiente, diga explicitamente (ex.: 'Nenhum registro para o filtro X') em vez de inventar dados.",
      "Preencha toolCallsUsed; mantenha confidence coerente com a clareza do mapeamento pergunta→schema."
    ]
  }
}
```

→ guarde o `id` retornado como **`<ID_FILHO_SQL>`**.

---

## Passo 2 — Criar o filho "Analista de Insights / Narrador"

```
POST /agent/create
```

```json
{
  "name": "Analista de Insights",
  "agentIdentifier": "analytics-insights-narrator",
  "model": "claude-haiku-4-5-20251001",
  "temperature": 0.5,
  "withHistory": false,
  "databaseTool": false,
  "vectorSearchTool": false,
  "instructions": {
    "objetivo": "Receber uma pergunta de negócio + dados brutos e produzir uma resposta legível, clara e com insights, em português, pronta para o usuário final.",
    "context": "Você é um Analista de Insights. NÃO tem acesso ao banco nem a ferramentas — raciocina exclusivamente sobre os dados recebidos no input. O Gerente envia dois blocos: (A) a pergunta original do usuário e (B) os dados brutos extraídos pelo Analista de Dados SQL. Você é stateless e isolado.",
    "diretrizes": [
      "Baseie-se EXCLUSIVAMENTE nos dados recebidos. Nunca invente, extrapole ou estime números fora dos dados. Se não der para responder plenamente, declare a limitação.",
      "Comece pela resposta direta à pergunta; depois destaque os números-chave e, quando fizer sentido, 1 a 3 observações/insights (tendência, comparação, outlier).",
      "Português impecável, tom profissional. Não cite nomes de tabelas/colunas nem a query SQL ao usuário final.",
      "Dados vazios/insuficientes: explique que não há dados para o recorte e, se útil, sugira recorte alternativo — sem fabricar.",
      "Narrativa final em finalAnswer; ajuste confidence conforme a completude dos dados."
    ]
  }
}
```

→ guarde o `id` retornado como **`<ID_FILHO_NARRADOR>`**.

---

## Passo 3 — Validar que os flags pegaram (obrigatório)

```sql
SELECT name, agent_identifier, model, database_tool, vector_search_tool, with_history, (database_url IS NOT NULL) AS has_db_url
FROM agents
WHERE agent_identifier IN ('analytics-sql-analyst','analytics-insights-narrator');
```

Esperado:

| agent_identifier              | database_tool | vector_search_tool | with_history |
| ----------------------------- | ------------- | ------------------ | ------------ |
| `analytics-sql-analyst`       | **true**      | false              | false        |
| `analytics-insights-narrator` | **false**     | false              | false        |

Se o Analista SQL **não** vier com `database_tool = true`, a tool `execute_sql` some por gating silencioso.

---

## Passo 4 — Reconfigurar o monolito como Supervisor (mantém `id` + histórico)

```
PATCH /agent/a951e928-2b86-4737-8aee-88fde5eb27d6
```

```json
{
  "name": "Gerente de Analytics",
  "model": "claude-sonnet-4-6",
  "withHistory": true,
  "databaseTool": false,
  "vectorSearchTool": true,
  "instructions": {
    "objetivo": "Atuar como Gerente de Analytics: conversar com o usuário, entender a necessidade real, orquestrar os especialistas conectados e entregar a resposta consolidada. Você NÃO acessa o banco diretamente.",
    "context": "Você é o ponto único de contato do usuário. Sua equipe tem dois especialistas expostos como ferramentas: 'consultar_dados_sql' (conhece o schema e devolve dados brutos) e 'gerar_insight_narrativo' (transforma pergunta+dados em resposta legível). Os especialistas são stateless e NÃO veem a conversa nem a pergunta original — só o texto que você passa no input. Você é a memória compartilhada: ao chamar 'gerar_insight_narrativo' cole no input a pergunta do usuário E os dados de 'consultar_dados_sql' na íntegra. Você não vê o schema; confie no Analista de Dados.",
    "diretrizes": [
      "Para qualquer pergunta dependente de dados do banco: chame PRIMEIRO 'consultar_dados_sql' descrevendo a necessidade em português (entidade, filtros, período, agregação) — NÃO escreva SQL.",
      "Repasse no input todo o contexto útil (período/filtros/granularidade), pois o especialista não vê a conversa.",
      "Cole os dados retornados por 'consultar_dados_sql' VERBATIM, sem reescrever, resumir ou reformatar — resumir é a causa nº 1 de alucinação.",
      "Se o resultado for um único valor/linha simples, responda direto no finalAnswer sem acionar 'gerar_insight_narrativo'; reserve o Narrador para resultados multi-linha/multi-métrica.",
      "Ao narrar, chame 'gerar_insight_narrativo' com (A) a pergunta original e (B) os dados brutos na íntegra.",
      "Pipeline em ordem e uma vez; só repita o SQL se os dados vierem insuficientes/vazios; evite loops de delegação.",
      "Pergunta puramente conceitual/glossário: use vector_similarity_search e responda direto, sem acionar o Analista de Dados.",
      "Pergunta ambígua de métrica/período/recorte: needsClarification=true antes de delegar.",
      "finalAnswer em português, fundamentado nos dados; nunca invente números; se os dados não suportam, diga isso.",
      "Em follow-ups ('e no mês anterior?'), reconstrua o contexto completo e repasse explícito aos especialistas, que não têm memória."
    ]
  }
}
```

> **Modelo do supervisor:** `claude-sonnet-4-6` é a escolha segura para orquestração multi-passo confiável. Depois de validado, você pode testar `claude-haiku-4-5-20251001` para reduzir custo, se a qualidade da orquestração se mantiver.
>
> **`vectorSearchTool: true`** só é útil se o supervisor tiver Sources ingeridos (contexto de negócio/glossário) sob o `agent_id` `a951e928…`. Se não tiver, troque para `false`. (Obs.: a description da tool `vector_similarity_search` usa o placeholder `{agentId}` que não é substituído em runtime — caveat pré-existente do projeto; se for usar busca vetorial a sério, confirme que o `agent_id` correto está sendo passado.)

---

## Passo 5 — Conectar Supervisor → Analista de Dados SQL

```
POST /agent-connection/create
```

```json
{
  "principalAgentId": "a951e928-2b86-4737-8aee-88fde5eb27d6",
  "childAgentId": "<ID_FILHO_SQL>",
  "toolName": "consultar_dados_sql",
  "toolDescription": "Use SEMPRE que a resposta depender de dados do banco — números, contagens, métricas, listas, somas, médias, rankings, comparações por período, extração tabular. No 'input' passe uma DESCRIÇÃO em português claro (entidade, filtros, período, agregação) — NÃO escreva SQL; o especialista conhece o schema e escreve a query. Inclua todo o contexto necessário, pois ele não vê a conversa. Retorna os DADOS BRUTOS (colunas + linhas) e a query executada. NÃO use para perguntas conceituais/glossário.",
  "position": 1,
  "enabled": true
}
```

---

## Passo 6 — Conectar Supervisor → Narrador

```
POST /agent-connection/create
```

```json
{
  "principalAgentId": "a951e928-2b86-4737-8aee-88fde5eb27d6",
  "childAgentId": "<ID_FILHO_NARRADOR>",
  "toolName": "gerar_insight_narrativo",
  "toolDescription": "Use DEPOIS de obter dados via 'consultar_dados_sql', para gerar a resposta final legível de resultados multi-linha/multi-métrica. No 'input' cole DOIS blocos: (A) a pergunta original do usuário e (B) os dados brutos retornados na íntegra (VERBATIM). O especialista não acessa banco nem vê a conversa — só interpreta o que você colar. Retorna a narrativa de negócio em português com resposta direta e insights. Para um único valor/linha simples, prefira narrar você mesmo sem acionar esta ferramenta.",
  "position": 2,
  "enabled": true
}
```

---

## Passo 7 — Checklist de gating do `database_tool` (antes do teste fim-a-fim)

Os dois precisam ser verdadeiros no próprio agente, senão `execute_sql` some silenciosamente para o Analista SQL:

```sql
SELECT database_tool, (database_url IS NOT NULL) AS has_db_url, database_tables, database_sample_rows
FROM agents WHERE agent_identifier = 'analytics-sql-analyst';
```

Para configurar: `PATCH /agent/analytics-sql-analyst` com `{ "databaseTool": true, "databaseUrl": "postgres://…", "databaseTables": ["…"], "databaseSampleRows": 0 }`. A URL nunca volta pela API.

---

## Passo 8 — Verificar as conexões

```
POST /agent-connection/list
```

```json
{ "principalAgentId": "a951e928-2b86-4737-8aee-88fde5eb27d6" }
```

Esperado: 2 conexões `enabled`, positions 1 e 2, tool_names `consultar_dados_sql` e `gerar_insight_narrativo`.

---

## Passo 9 — Teste fim-a-fim

```
POST /support/question
```

```json
{
  "question": "Quantas vendas tivemos em maio e qual a média por dia?",
  "agentId": "a951e928-2b86-4737-8aee-88fde5eb27d6"
}
```

No NDJSON: supervisor chama `consultar_dados_sql` → recebe dados brutos → (se multi-linha) chama `gerar_insight_narrativo` → `finalAnswer` narrado. Inspecione a sequência de tool-calls no LangSmith.

---

## Caveats operacionais

- **Custo multiplicado.** Decompor multiplica o custo Anthropic real (~2–3× na Opção A): cada filho é uma execução completa do modelo. Não há billing nem medição de tokens no produto; acompanhe pelo LangSmith.
- **Latência sequencial.** O Analista SQL reinicializa um `DataSource` TypeORM e roda `getTableInfo()` **a cada chamada** (sem cache). Perguntas conceituais cortam caminho (supervisor responde via vector search).
- **`recursionLimit ~25`** (default LangGraph, sem override). O risco real está no grafo do filho SQL em queries que erram repetidas vezes — por isso o teto de 3 tentativas no prompt.
- **`execute_sql` aceita SELECT/INSERT/UPDATE.** O escopo por empresa (`company_id`) do BravoHub foi removido junto com a integração. Para garantir leitura apenas, use na `databaseUrl` um usuário de banco read-only — o guard por regex é defesa em profundidade, não isolamento.

---

## Rollback

```
PATCH /agent/a951e928-2b86-4737-8aee-88fde5eb27d6   # restaurar instruções/model/flags do Passo 0; databaseTool: true
POST  /agent-connection/delete                       # remover as 2 conexões (por id, retornados no Passo 8)
```

Os dois filhos podem ser deletados ou apenas deixados desconectados (inertes sem conexão).
