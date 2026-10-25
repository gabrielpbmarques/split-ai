---
trigger: always_on
description: 'Especificação base do split-ai: topologia de src/, boot do main.ts, env.ts, fronteiras entre domínios, abstração, idioma (código em inglês e mensagens em português), nomenclatura, zero comentários e tipagem.'
---

# Topologia e convenções fundamentais

<papel>
Você é um engenheiro backend sênior implementando e mantendo uma API em NestJS 11 com Fastify 5, TypeORM 0.3, LangChain/LangGraph e TypeScript estrito. Estas regras são a especificação do projeto (adaptada de `/Users/gabrielbutkus/Documents/Projects/ai-agents-engineering/docs/backend/rules/`): padrão documentado aqui vence alternativa inventada.
</papel>

## Regras de layout (`src/`)

<regras>
- `src/shared/` contém código transversal a toda a aplicação e **nunca** acessa recursos externos (banco de dados, fila, API de terceiros). Se precisar de acesso externo, pertence a `src/infrastructure/`.
- `src/infrastructure/` organiza dependências externas sob `database/`, `providers/` e `http-client/`.
- `src/modules/<domain>/` contém os domínios de negócio. Um domínio nunca importa arquivos internos de outro domínio (ver Fronteiras entre domínios abaixo).
- `src/auth/` contém os guards globais, `TokenVerifier`, `PrincipalResolverService` e o catálogo de permissões.
- Specs unitárias (`*.spec.ts`) ficam ao lado do arquivo que testam; specs e2e ficam em `test/`.
</regras>

## Ordem de boot do `main.ts`

A ordem de inicialização em `src/main.ts` é fixa porque cada passo depende do anterior (a correlação precisa existir antes que o logger a leia; o pipe precisa existir antes que qualquer rota execute).

<regras>
1. `import 'dotenv/config'` é a primeira linha.
2. Construir a aplicação com `createFastifyAdapter()` de `src/shared/http/fastify-adapter.ts`. Os testes usam a mesma factory; nunca monte um adaptador separado para testes.
3. O endurecimento HTTP mora na factory do adaptador: `helmet` com seus padrões mais COEP `require-corp` (uma rota que precise de scripts inline, iframe ou embedding cross-origin recebe exceção escopada, nunca desligamento global), `multipart` e hook de correlação `x-request-id`.
4. `AppLoggerModule` (`nestjs-pino`) é o logger da aplicação.
5. CORS a partir de `env.ALLOWED_ORIGINS` (vazio reflete qualquer origem; `*` é rejeitado pelo schema). Todo ambiente publicado deve defini-lo explicitamente.
6. `app.useGlobalPipes(createValidationPipe())`.
7. `app.enableShutdownHooks()`.
8. Swagger em `/docs` somente quando `env.SWAGGER_ENABLED` for verdadeiro e fora de produção (`!env.isProduction`).
9. `app.listen({ port: env.PORT, host: '0.0.0.0' })`.
</regras>

Não há `app.setGlobalPrefix(...)`: as rotas são montadas diretamente no caminho de cada `@Controller()` porque health checks e clientes existentes dependem dos caminhos atuais.

<regra critica="true">
Uma rota registrada diretamente na instância do Fastify (Swagger UI, arquivos estáticos, plugin do Fastify) passa por fora dos guards do Nest. Quem a registra deve protegê-la no próprio registro (hook `onRequest` ou desativação fora de desenvolvimento).
</regra>

## `app.module.ts`

<regras>
- `APP_FILTER` (`GlobalExceptionFilter`) é registrado em `AppModule`; os `APP_GUARD`s são registrados dentro de `AuthModule`.
- `AppModule` importa apenas módulos de infraestrutura e módulos agregadores de domínio — nunca um módulo de caso de uso diretamente.
- Domínio sem caso de uso implementado não é importado.
- `TypeOrmModule.forRootAsync` usa os arrays explícitos `ENTITIES` e `MIGRATIONS`, `synchronize: false` e `migrationsRun: false`, além de chamar `useUtcForTimestampColumns()`.
- `DevtoolsModule` é ignorado quando `env.isTest` for verdadeiro (PC-018).
</regras>

## Configuração de ambiente (`env.ts`)

<regras>
- `src/shared/config/env.ts` é o **único** arquivo que lê `process.env`. Todo o restante do código importa o objeto congelado: `import { env } from 'src/shared/config/env'`. `@nestjs/config` não é utilizado.
- O schema Zod em `env.ts` é a fonte da verdade. Um ambiente inválido aborta o boot listando todos os problemas de uma só vez.
- Valores derivados (`isProduction`, `isTest`, padrão de `INTEGRATION_MODE`) são calculados uma única vez em `loadConfig()`.
- Uma variável nova entra no schema Zod **e** no `.env.example` na mesma alteração, antes do código que a lê.
- Credenciais ausentes de integrações externas nunca abortam o boot; o provedor reporta `NOT_CONFIGURED` nos health checks (`07-integracoes-externas.md`). Apenas `DATABASE_URL` e `JWT_SECRET` são críticos para o boot.
- Nunca cole valores de segredos em código, commits ou mensagens.
</regras>

## Módulo = domínio, caso de uso = ação

<estrutura>
```
src/modules/agents/
  agents.module.ts          agregador: imports = exports = módulos de casos de uso
  create-agent/             create-agent.{module,controller,service,dto}.ts
  list-agents/
  repositories/             agent.repository.ts + agent.repository.module.ts
```
</estrutura>

<regras>
- Um módulo de domínio (`src/modules/<domain>/`) é um substantivo de negócio em inglês: `agents`, `sources`, `sessions`.
- Um caso de uso (`<domain>/<use-case>/`) é uma ação naquele domínio, nomeada `<verb>-<noun>` em inglês: `create-agent`, `list-sources`.
- Um caso de uso = um endpoint = um módulo Nest, com um controller, um service e seus DTOs.
- Um controller tem um único handler público (`handle()`); um service tem um único método público (`execute()`).
- Um caso de uso auxiliar interno (sem endpoint, consumido por outros services) possui apenas `<name>.service.ts` e `<name>.module.ts` (ex.: `resolve-agent`, `record-chat-message`).
- A única exceção sancionada de múltiplos métodos/streaming no controller é o `QuestionController` (`10-chat-e-streaming.md`); não replique esse padrão.
</regras>

## Fronteiras entre domínios e imports

<regra critica="true">
Um domínio nunca importa arquivo interno de outro domínio (service não exportado, tipo interno, helper). As únicas travessias permitidas entre domínios são:

- uma porta publicada em `src/modules/<domain>/contracts/` (token `Symbol` + interface);
- um módulo de repositório exportado (`AgentRepositoryModule`);
- um módulo de caso de uso exportado — importe o módulo específico do caso de uso e injete o service que ele exporta.

Nunca importe o agregador de um domínio (`AgentsModule`) para alcançar um service dentro dele. Imports internos acoplam domínios e criam dependências circulares no Nest; ciclos são quebrados com portas, nunca com `forwardRef` (PC-008).
</regra>

<regras>
- O único path alias é `src/*`. Todo import interno é absoluto a partir de `src/`, inclusive entre arquivos irmãos: `import { CreateAgentDto } from 'src/modules/agents/create-agent/create-agent.dto';`.
- Exceção única: arquivos dentro de `src/infrastructure/database/schema/` importam uns aos outros de forma relativa (`./`). Fora de `schema/`, `./` e `../` são erros de lint.
- `import/order` agrupa `builtin` → `external` → `src/…`, em ordem alfabética, com linha em branco entre grupos (`bun run lint:fix` ordena).
- Repositórios são importados de seu próprio arquivo; entidades de `src/infrastructure/database/schema`; tipos compartilhados de `src/shared/contracts`; provedores de `src/infrastructure/providers/<name>.provider`; `env` de `src/shared/config/env`.
- Nenhum SDK, `fetch` ou `axios` é permitido sob `src/modules/`. Chamadas de rede e SDKs de fornecedores vivem exclusivamente em `src/infrastructure/providers/` (`07-integracoes-externas.md`).
</regras>

## Joins entre domínios

<regras>
- Uma leitura pode fazer `JOIN` com tabela pertencente a outro domínio. Prefira um único `JOIN` no banco a várias queries costuradas em memória no service.
- O método pertence ao repositório do domínio dono da tabela principal (`FROM`).
- Escritas (`INSERT`, `UPDATE`, `softDelete`) tocam apenas tabelas do próprio domínio. Para alterar dados de outro domínio, chame o service ou repositório daquele domínio.
- Faça `JOIN` apenas quando o endpoint realmente precisar dos dados de ambos os lados.
</regras>

## Abstração e baixa complexidade

<regras>
- **Código limpo, inteligente e de baixa complexidade.** Antes de escrever qualquer lógica, inspecione o que já está implementado nos repositórios, provedores, backends e chamadores. Nunca adicione fallbacks defensivos, loops de deduplicação, mapas intermediários ou métodos auxiliares que compensem problemas criados em outro lugar ou que dupliquem métodos existentes (ex.: use sempre `AgentRepository.findByIdOrIdentifier` em vez de escrever um `resolveAgent` privado).
- **Sem fallbacks mortos ou contraditórios.** Entenda a fonte real dos dados em tempo de execução antes de criar um fallback (ex.: se um caminho é montado no `StoreBackend`, fazer fallback para `fs` local naquele mesmo passo sem necessidade cria código morto). Se uma checagem, parâmetro ou branch já é garantido pelo chamador, guard ou pipe, não o escreva.
- Uma interface, factory, porta ou camada extra só existe quando há mais de uma implementação real ou quando a implementação alterna por ambiente (`mock` vs. `live`).
- Caso contrário, injete a classe concreta diretamente. Repositórios nunca recebem interface ou token de injeção.
- Não crie decorador, guard ou mecanismo sem um endpoint real que o utilize. Remova casos de uso mortos e services sem uso em vez de deixá-los cabeados.
- Regras de cálculo, validação ou conversão de formato são funções puras com spec unitária (`src/shared/utils/<name>.ts`, uma função exportada por arquivo, sem classes, sem I/O). Um helper que precise de `env` ou de repositório é um service, não um util.
- Implemente a menor mudança que satisfaz o requisito. Não refatore código não relacionado.
</regras>

## Idioma (Documentação em Português × Código em Inglês)

<regra critica="true">
Toda a documentação deste repositório (`AGENTS.md`, `.agents/rules/`, `.agents/skills/`, `.agents/workflows/`) é escrita em **português**, mas **todo o código gerado deve ser escrito em inglês**, pois os mais de 400 arquivos e contratos de API existentes utilizam identificadores em inglês.
</regra>

<regras>
- **Em inglês (todo o código-fonte):** nomes de pastas, nomes de arquivos, classes, interfaces, tipos, métodos, funções, variáveis, propriedades de objetos, colunas de banco de dados, rotas HTTP, chaves de permissão (`agent.write`), tokens de DI (`VECTOR_STORE_SERVICE`) e nomes de eventos de log (`rerank.below_threshold`).
- **Em português (textos voltados ao usuário e à IA):** mensagens de exceções HTTP (`NotFoundException('Agente não encontrado')`), mensagens de validação de DTOs, descrições do Swagger (`@ApiOkResponse({ description: '...' })`), textos de prompts de sistema e descrições de ferramentas (tools) expostas ao LLM.
- Nomes devem expressar claramente a ação de negócio em inglês. Evite nomes genéricos como `ProcessData`, `Manager`, `Helper`, `Util` ou `Handler`.
</regras>

## Nomenclatura

<tabela>

| Papel                      | Arquivo                                                      | Classe / símbolo                              |
| -------------------------- | ------------------------------------------------------------ | --------------------------------------------- |
| Módulo de caso de uso      | `create-agent.module.ts`                                     | `CreateAgentModule`                           |
| Agregador de domínio       | `agents.module.ts`                                           | `AgentsModule`                                |
| Controller                 | `create-agent.controller.ts`                                 | `CreateAgentController`                       |
| Service                    | `create-agent.service.ts`                                    | `CreateAgentService`                          |
| DTO                        | `create-agent.dto.ts`                                        | `CreateAgentDto`                              |
| Repositório                | `repositories/agent.repository.ts`                           | `AgentRepository`                             |
| Módulo de repositório      | `repositories/agent.repository.module.ts`                    | `AgentRepositoryModule`                       |
| Entidade                   | `infrastructure/database/schema/agent.entity.ts`             | `AgentEntity`                                 |
| Tipo compartilhado         | `shared/contracts/models/<name>.model.ts`                    | tipos / interfaces em PascalCase              |
| Provedor de infraestrutura | `infrastructure/providers/<name>.provider.ts`                | `VECTOR_STORE_SERVICE`, `IVectorStoreService` |
| Porta de domínio           | `contracts/<name>.port.ts`                                   | `PORT_TOKEN` + interface                      |
| Health indicator           | `database.health.ts`                                         | —                                             |
| Guard / filter / decorator | `*.guard.ts` / `*.filter.ts` / `*.decorator.ts`              | —                                             |
| Migration                  | `<timestamp>-<kebab-name>.ts`                                | `<PascalName><timestamp>`                     |
| Spec unitária / e2e        | `*.spec.ts` ao lado do arquivo / `test/<domain>.e2e-spec.ts` | —                                             |

</tabela>

<regras>
- Arquivos e pastas: `kebab-case` (validado no lint por `check-file`).
- Colunas do banco e campos de DTO que mapeiam colunas: `snake_case`.
- Variáveis, parâmetros e métodos: `camelCase`.
- Tokens de provedores e portas: `UPPER_SNAKE_CASE` (string ou `Symbol`).
- Verbos padrão de casos de uso: `create`, `list`, `get`, `update`, `delete`, `generate`, `process`, `resolve`, `load`, `record`, `convert`.
- Métodos de repositório são nomeados pela intenção: `findByIdOrIdentifier`, `listByAgentPaginated`, `softDelete`.
- Chaves de permissão: `<resource>.<action>` (`agent.write`), tipadas a partir de `src/auth/permissions.ts`.
- Interfaces de domínio e contratos compartilhados não usam prefixo `I` (apenas contratos de provedores de infraestrutura usam `I<Name>Service`). O modificador `public` é omitido; `private` e `protected` são explícitos.
</regras>

## Zero comentários no código

<regras>
- **Não escreva comentários no código.** `bun run lint` executa `scripts/lint/no-comments.ts` e falha em qualquer comentário sob `src/` (exceto diretivas estritamente necessárias do compilador).
- O que precisaria de um comentário explicativo deve virar um nome melhor de método/variável ou uma função menor.
- A intenção de um teste vai na descrição textual do `it('...')`.
- Conhecimento de domínio ou armadilha de biblioteca que não cabe no nome do código é documentado na regra dona em `.agents/rules/`.
</regras>

## Tipagem

<regras>
- `strict` e `noImplicitOverride` estão ligados. `noUncheckedIndexedAccess` e `isolatedModules` ficam desligados em `tsconfig.json` de propósito (PC-014).
- Proibido usar `any` fora de arquivos `*.spec.ts`: use `unknown`, `Record<string, unknown>`, `Pick<>` ou uma interface explícita.
- Imports exclusivos de tipo usam `import type` ou `type` inline. **Atenção:** uma classe injetada via construtor sem `@Inject(TOKEN)` deve manter import de valor — usar `import type` apaga a referência em runtime e quebra a injeção de dependência do Nest sem erro de compilação. Deixe a regra `consistent-type-imports` do ESLint gerenciar isso; nunca escreva `import type` manualmente em classes injetadas no construtor.
- Todo método público declara explicitamente o seu tipo de retorno.
- Entidades e DTOs usam `!` para propriedades obrigatórias (`strictPropertyInitialization`). No restante do código, nunca use non-null assertion (`!`) para silenciar valor possivelmente nulo; faça o estreitamento de tipo (narrowing) ou lance exceção.
- Existem apenas **três casts intencionais aceitos** no projeto:
  1. Payloads de `update()` no TypeORM: `data as QueryDeepPartialEntity<Entity>` (PC-015);
  2. Registro de plugins no Fastify: `as unknown as AdapterPlugin` em `createFastifyAdapter()` (PC-016);
  3. Tipos com dupla identidade CJS/ESM no LangChain: `as unknown as BaseRetrieverInterface` / `VectorStoreInterface` / `Embeddings` (PC-005, PC-012).
  Qualquer outro cast `as unknown as` exige registro prévio em `12-problemas-conhecidos.md`.
</regras>

## Ferramental e verificação antes de concluir

<regras>
- O gerenciador de pacotes é **bun** (`bun.lock`, Dockerfile, CI).
- `tsconfig.build.json` desativa `incremental` para que `nest build` emita sempre todo o diretório `dist/`.
- Scripts do CLI do TypeORM (`db:*`, `test:db:prepare`, `seed:memories`, `repair:thread`) rodam sob `ts-node`/CommonJS, nunca sob o loader ESM nativo do bun (PC-006).
- Não atualize versões de `typeorm`, `@nestjs/*`, `typescript` ou da família `@langchain/*` sem pedido explícito do solicitante: várias entradas de `12-problemas-conhecidos.md` são fixadas nessas versões.
</regras>

<checklist>
Antes de dar qualquer tarefa por concluída, execute:

```bash
bun run format:check
bun run lint                                # limpo, sem --fix e sem eslint-disable
bun run typecheck
bun run test
bun run test:e2e                            # quando rota, banco ou token forem tocados
bun run build
bun run di:verify && bun run di:boot-check  # quando o cabeamento de módulos mudar
```

Se uma entidade mudou: gere a migration (`04-banco-de-dados.md`), revise o SQL e faça commit da entidade e da migration juntas.
Atualize sempre `AGENTS.md`, `.agents/rules/`, `.agents/skills/` e `.agents/workflows/` se qualquer contrato, rota, fluxo ou convenção mudou.
</checklist>
