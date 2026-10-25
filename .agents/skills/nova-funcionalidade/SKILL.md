---
name: nova-funcionalidade
description: 'Analisa a demanda, escreve o plano de implementação e implementa na ordem certa qualquer funcionalidade nova, endpoint, caso de uso, tabela ou integração no Sherlock AI (split-ai). Use antes de implementar mudanças que atravessam mais de um arquivo ou criam rota/tabela/integração.'
---

# Fluxo para implementar uma funcionalidade nova

<regra critica="true">
Responda a todas as perguntas da Parte 1, escreva o plano no formato da Parte 2 e apresente-o ao solicitante antes de escrever código. Em seguida, implemente na ordem da Parte 3. Quando uma resposta depender de informação ausente na demanda, pergunte ao solicitante em vez de supor: uma suposição errada embutida em um schema de banco ou contrato de endpoint custa caro para desfazer.
</regra>

Ajustes pontuais (um bug isolado em um único service, um texto de mensagem) não exigem o plano completo; basta uma linha descrevendo a alteração. Qualquer mudança que adicione ou altere endpoint, tabela, coluna, integração ou dependência exige este fluxo.

## Parte 1 — Análise da demanda

Investigue o código antes de responder: leia os arquivos reais e procure implementações parecidas com `grep`. Não afirme nada sobre código que você não abriu.

<perguntas>

| #   | Pergunta                                                                                                           | Consequência                                                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Qual o objetivo principal, em uma frase?                                                                           | Define o que está dentro e fora do escopo.                                                                                                                                         |
| 2   | Existe implementação igual ou parecida nos módulos e services atuais?                                              | Reutilize. Nunca duplique service, método de repositório (`findByIdOrIdentifier`), util ou validação.                                                                              |
| 3   | É comportamento interno do sistema (processamento/background), funcionalidade de usuário (endpoint HTTP) ou ambos? | Sistema: caso de uso auxiliar (`service` + `module`, sem controller/DTO). Usuário: caso de uso HTTP completo. Ambos: separe a ação HTTP do processamento auxiliar.                 |
| 4   | Precisa de serviço externo?                                                                                        | Siga `.agents/rules/07-integracoes-externas.md`.                                                                                                                                   |
| 5   | Precisa de biblioteca nova?                                                                                        | Instale apenas se a stack atual não resolver e se não duplicar capacidade existente. Peça aprovação antes de rodar `bun add`.                                                      |
| 6   | Cria tabela ou adiciona/remove/altera coluna, índice ou constraint? Há dados existentes para migrar?               | Siga `.agents/rules/04-banco-de-dados.md`. Remover ou alterar coluna exige mapear todos os leitores e escritores antes.                                                            |
| 7   | Envolve dados novos? Quais entidades e tipos compartilhados?                                                       | Entidade em `src/infrastructure/database/schema/`; tipos em `src/shared/contracts/models/`.                                                                                        |
| 8   | Quais módulos de domínio estão envolvidos? Eles já existem?                                                        | Novo substantivo de negócio → novo domínio. Nova ação sobre entidade existente → caso de uso no domínio existente.                                                                 |
| 9   | Quais casos de uso estão envolvidos? Eles já existem?                                                              | Liste cada um como `<verb>-<noun>` (em inglês). Reutilize um service existente importando o módulo específico daquele caso de uso.                                                 |
| 10  | Algum código existente muda? Quais arquivos?                                                                       | Liste cada arquivo e a mudança de comportamento.                                                                                                                                   |
| 11  | Quem consome o que muda (neste repo e no `split-client`)? Há risco de regressão?                                   | Mapeie consumidores com `grep` (imports, rotas, tabelas, portas, contratos em `../split-client/shared/contracts/`). Cada consumidor afetado entra no plano com cobertura de teste. |
| 12  | Quais ações o usuário pode executar no fluxo?                                                                      | Cada ação HTTP do usuário = um caso de uso HTTP próprio.                                                                                                                           |
| 13  | Para novos endpoints: o que recebem e o que retornam?                                                              | Defina método HTTP, rota, DTO de entrada, formato de resposta e status HTTP antes de implementar.                                                                                  |
| 14  | Cada endpoint é público ou privado? Quais papéis (`admin`, `user`, `guest`) e qual permissão?                      | `@Public()` apenas com requisito explícito. Escolha a chave de `@RequirePermissions` em `src/auth/permissions.ts` (`06-autenticacao-e-autorizacao.md`).                            |
| 15  | Precisa de validação além do DTO (regra de negócio, unicidade, estado da entidade)?                                | Formato/tipo no DTO (`class-validator`); regras de negócio e estado no service.                                                                                                    |
| 16  | Alguma biblioteca envolvida possui trava registrada?                                                               | Consulte `.agents/rules/12-problemas-conhecidos.md` (skill `problema-conhecido`).                                                                                                  |
| 17  | Há risco de performance?                                                                                           | Passe pelo checklist de performance abaixo.                                                                                                                                        |
| 18  | Há risco de segurança?                                                                                             | Passe pelo checklist de segurança abaixo.                                                                                                                                          |

</perguntas>

<checklist titulo="Performance">
- [ ] Nenhuma query dentro de loop (`N+1`); use `JOIN`, `IN` ou query em lote no repositório.
- [ ] Toda listagem é paginada (`PaginationDto`, `limit` ≤ 100) e projeta apenas os campos necessários via `fields`.
- [ ] Leituras e resoluções assíncronas independentes rodam em paralelo (`Promise.all`).
- [ ] Colunas usadas em filtros, ordenação e joins possuem índice.
- [ ] Transações contêm apenas operações de banco de dados e são curtas.
- [ ] Chamadas externas têm timeout e circuit breaker e nunca rodam dentro de transação.
- [ ] Processamento lento não bloqueia a requisição HTTP (ex.: ingestão assíncrona respondendo `202`).
- [ ] Arrays de entrada têm tamanho máximo validado no DTO (`@ArrayMaxSize`).
- [ ] Chamadas ao LLM e à Voyage AI são controladas (cota da Voyage sem cartão padrão é de 3 RPM, PC-007).
</checklist>

<checklist titulo="Segurança">
- [ ] Rota protegida por `@RequirePermissions(...)`; `@Public()` apenas com requisito explícito.
- [ ] Toda entrada validada por DTO (o pipe global rejeita campos desconhecidos).
- [ ] Resposta sem campos sensíveis ou internos (`password`, tokens).
- [ ] Nenhum dado sensível ou token em logs.
- [ ] Chamadas externas isoladas em `src/infrastructure/providers/`; HTTP manual via `ResilientClient` com host em `HTTP_ALLOWED_HOSTS`.
- [ ] Segredos e URLs em `env.ts` (`.env.example`), nunca no código.
- [ ] O ID do ator vem de `@AuthUser()`, nunca do corpo da requisição.
</checklist>

## Parte 2 — Plano de implementação

<regras>
- Todo plano segue a estrutura abaixo, na ordem, com todas as seções. Seção sem conteúdo recebe `"Não se aplica."`.
- Escreva em tópicos, em linguagem lógica e em **português** (lembrando que os nomes de arquivos, classes, métodos e colunas que serão criados no código são em **inglês**).
- Não coloque blocos de implementação de código no plano. Descreva o que fazer, não como digitar.
- O fluxo do service é uma lista numerada de passos lógicos. Fluxo alterado mostra o passo atual e o passo novo.
- Cada endpoint ganha sua própria subseção.
</regras>

<estrutura>
```markdown
# Plano: <título curto da demanda>

## 1. Objetivo

<uma frase; o que está fora do escopo>

## 2. Contexto

- Implementações existentes relacionadas
- O que será reutilizado

## 3. Banco de dados

- Tabelas novas: nome, colunas, tipos, nulidade, índices, constraints
- Tabelas alteradas: coluna adicionada, removida ou alterada, e o motivo
- Migração de dados existentes
- Ou: "Não se aplica."

## 4. Endpoints

### <MÉTODO> <rota>

- Caso de uso: `<verb>-<noun>`, novo ou existente
- Visibilidade: público ou privado
- Papéis: <papéis que possuem a permissão>
- Permissão: `<chave de @RequirePermissions>`
- DTO de entrada: campo, tipo, obrigatoriedade e validação
- Resposta: status HTTP e campos retornados
- Erros: status HTTP e condição de disparo de cada um

## 5. Validações novas

- Validação, camada (DTO ou service) e exceção retornada

## 6. Fluxo lógico do service

### <NomeService> (novo | alterado)

1. <passo lógico>
2. <passo lógico>

- Alteração: passo atual → passo novo

## 7. Artefatos

| Ação                      | Tipo                                                                         | Caminho   |
| ------------------------- | ---------------------------------------------------------------------------- | --------- |
| criar / alterar / remover | módulo, controller, service, dto, repositório, entidade, migration, provedor | `src/...` |

## 8. Impacto e regressão

- Consumidores do código alterado (incluindo `split-client`) e efeito esperado
- Testes existentes afetados e testes novos (`test/<domain>.e2e-spec.ts` / `*.spec.ts`)

## 9. Riscos e dúvidas em aberto

- Perguntas pendentes ao solicitante
- Travas conhecidas aplicáveis (`PC-NNN`)

```
</estrutura>

## Parte 3 — Ordem de implementação

<estrutura>
```

1. Banco de dados entidade em schema/ + export em schema/index.ts (ENTITIES) → db:generate contra espelho → revisar SQL → registrar em migrations/index.ts (MIGRATIONS)
2. Tipos src/shared/contracts/models/<name>.model.ts (+ export no index.ts)
3. Provedores (se houver integração externa) src/infrastructure/providers/<name>.provider.ts + InfrastructureModule + infrastructure.health.ts
4. Módulos base repositório + módulo de repositório; <domain>.module.ts (se novo domínio) + registro no AppModule
5. Casos de uso para cada um: dto → service → controller → module → registro no agregador <domain>.module.ts
6. Testes e2e por caso de uso em test/<domain>.e2e-spec.ts; spec unitária para funções puras e provedores
7. Documentação atualizar AGENTS.md, .agents/rules/, .agents/skills/ e .agents/workflows/ com todas as mudanças relevantes (inegociável)
8. Verificação format:check, lint, typecheck, test, test:e2e, build, di:verify && di:boot-check

```
</estrutura>

<regras>
- Uma nova variável de ambiente entra em `src/shared/config/env.ts` e `.env.example` antes do código que a utiliza.
- Ordem entre casos de uso de um recurso: `create` → `get` / `list` → `update` → `delete`.
- Um caso de uso auxiliar interno é implementado antes do caso de uso HTTP que o consome.
- Todo código gerado deve ter identificadores em **inglês** e mensagens de erro/validação/Swagger em **português** (`01-topologia-e-convencoes.md`).
</regras>

## Parte 4 — Checklist de encerramento

Este é também o checklist exigido em `.github/pull_request_template.md`:

<checklist>
- [ ] As 18 perguntas foram respondidas e o plano foi apresentado antes do código.
- [ ] Consumidores do código alterado foram mapeados e estão cobertos por testes.
- [ ] Cada caso de uso tem pasta própria com um único `handle()` e `execute()`, registrado em `imports` e `exports` do agregador do domínio.
- [ ] Regras de negócio apenas em services; queries apenas em repositórios, com `tx?: Executor` por último em escritas.
- [ ] Sem import de arquivo interno de outro domínio; sem escrita em tabela de outro domínio; sem `forwardRef`.
- [ ] Sem abstração ou dependência nova sem necessidade real imediata.
- [ ] Entidades alteradas possuem migration gerada, revisada e registrada (`bun run db:check`).
- [ ] Sem comentários sob `src/`, sem `console.*`, sem `any` fora de specs e sem `process.env` fora de `env.ts`.
- [ ] Documentação de *agent-driven development* (`AGENTS.md`, `.agents/rules/`, `.agents/skills/` e `.agents/workflows/`) atualizada e sincronizada.
- [ ] Comandos de verificação executados sem erros.
- [ ] Toda trava investigada durante a tarefa foi registrada em `.agents/rules/12-problemas-conhecidos.md`, resolvida ou não.
</checklist>
```
