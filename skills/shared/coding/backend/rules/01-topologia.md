# Topologia do projeto

## Raiz

<estrutura>
```
.
├── src/                 código-fonte
├── test/                testes e2e (*.e2e-spec.ts) + bootstrap de teste
├── drizzle/             migrations SQL geradas + snapshots (nunca editar à mão)
├── drizzle.config.ts    aponta para src/infrastructure/database/schema/
├── scripts/             ferramentas de desenvolvimento
├── nest-cli.json        sourceRoot "src"; plugin Swagger lê *.dto.ts
├── tsconfig.json / tsconfig.build.json
├── vitest.config.ts / vitest.unit.config.ts
├── eslint.config.mjs
├── .env.example
└── package.json
```
</estrutura>

## `src/`

<estrutura>
```
src/
  main.ts                  bootstrap
  app.module.ts            módulo raiz
  auth/                    guards globais, verificação de token, resolução de identidade, escopo de acesso
  infrastructure/          recursos externos usados por mais de um domínio, agrupados por dependência
    database/              pool, client do ORM, schema centralizado, executor de transação
    integration/           camada de integração com fontes externas
    messaging/             publicação de eventos atrás de porta
  modules/                 domínios de negócio
    <dominio>/
      <dominio>.module.ts  agregador dos módulos de caso de uso
      <caso-de-uso>/       um caso de uso = um endpoint = uma pasta
      models/              tipos do domínio derivados do schema
      repositories/        acesso a dados do domínio
      contracts/           portas publicadas para outros domínios (quando necessário)
  shared/                  transversal de aplicação
    config/                schema de ambiente (env.ts)
    contracts/             tipos compartilhados (ErrorResponse, paginação)
    decorators/            decorators de rota
    http/                  fábricas do adapter, filtro de exceção, interceptors, health
    observability/         logger, correlação de request, redação
  types/                   declarações de tipo globais (ex.: augmentação do request)
```
</estrutura>

<regras>
- `shared/`: não depende de recurso externo (banco, fila, API).
- `infrastructure/`: uma subpasta por dependência externa, nunca por tipo de arquivo.
- `modules/`: um domínio não importa arquivo interno de outro domínio (ver [`02-convencoes-fundamentais.md`](02-convencoes-fundamentais.md)).
- Testes unitários (`*.spec.ts`) ficam ao lado do arquivo testado; e2e ficam em `test/`.
</regras>

## `main.ts`

<regras>
Ordem obrigatória:

1. `import 'dotenv/config'` é a primeira linha do arquivo.
2. Criar a aplicação com a fábrica de adapter compartilhada com os testes (`createFastifyAdapter()`). Nunca montar adapter separado em teste.
3. Aplicar segurança HTTP: helmet/CSP e CORS por allowlist explícita (nunca `*`).
4. Registrar o contexto de correlação de request via hook do adapter HTTP.
5. `app.setGlobalPrefix(env.API_PREFIX)`.
6. `app.useGlobalPipes(createValidationPipe())` com `transform: true`, `whitelist: true`, `forbidNonWhitelisted: true`, `forbidUnknownValues: true`, `enableImplicitConversion: false`.
7. `app.enableShutdownHooks()`.
8. Swagger só fora de produção e só com `env.SWAGGER_ENABLED`.
9. `app.listen({ port: env.PORT, host: '0.0.0.0' })`.
</regras>

<regra critica="true">
Rota registrada direto na instância do Fastify (Swagger, arquivo estático, plugin) não passa pelos guards do Nest. Quem registra é responsável por protegê-la.
</regra>

## `app.module.ts`

<exemplo>
```ts
@Module({
  imports: [
    AppLoggerModule,
    HealthModule,
    IntegrationModule,
    MessagingModule,
    AuthModule,
    PedidosModule,
    UsuariosModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
```
</exemplo>

<regras>
- `APP_FILTER` e `APP_INTERCEPTOR` são registrados em `AppModule`.
- `APP_GUARD` é registrado dentro de `AuthModule`.
- `AppModule` importa apenas módulos agregadores de domínio, nunca módulos de caso de uso.
- Módulo de domínio sem caso de uso implementado não é importado em `AppModule`.
</regras>

## Configuração de ambiente

<exemplo>
```ts
// src/shared/config/env.ts
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  API_PREFIX: z.string().default('api'),
  DATABASE_URL: postgresUrl,
  ALLOWED_ORIGINS: originList,
});

export interface AppConfig extends z.infer<typeof envSchema> {
readonly isProduction: boolean;
readonly isTest: boolean;
}

export const env: AppConfig = loadConfig();

````
</exemplo>

<regras>
- Não usar `@nestjs/config`. `env` é um objeto congelado, importado diretamente: `import { env } from 'src/shared/config/env'`.
- `process.env` só é lido em `src/shared/config/env.ts`.
- Validação inválida derruba o boot listando todos os problemas.
- Campos derivados (`isProduction`, URLs compostas) são calculados uma vez em `loadConfig()`.
- `ALLOWED_ORIGINS` rejeita `*`.
- Variável nova: adicionar ao schema em `env.ts` e ao `.env.example`. O schema é a fonte de verdade.
</regras>

## Imports

<regras>
- Único path alias: `"src/*": ["./src/*"]`.
- Todo import interno usa caminho absoluto a partir de `src/`, inclusive entre arquivos vizinhos.
- Exceção: arquivos em `src/infrastructure/database/schema/` usam import relativo entre si.
</regras>

<exemplo>
```ts
import { CriarPedidoDto } from 'src/modules/pedidos/criar-pedido/criar-pedido.dto';
````

</exemplo>

## Ferramentas

<regras>
- Arquivos e pastas em kebab-case, forçado por lint.
- Comentário inline é erro de lint.
- `console.log` é erro de lint; usar o logger.
- `any` é erro de lint.
- Opções de lint que recebem caminho (`injectable-should-be-provided`, resolver de imports) usam caminho absoluto (`import.meta.dirname`).
- `tsconfig.build.json` desativa `incremental`.
- Vitest usa `unplugin-swc` com `legacyDecorator: true` e `decoratorMetadata: true`.
- Schema de banco: apenas `db:generate` + `db:migrate`. `db:push` é proibido.
- Não atualizar versão de `drizzle-orm`, `drizzle-kit`, `@nestjs/*` ou `typescript` sem solicitação explícita.
</regras>

## Verificação antes de concluir uma tarefa

<checklist>
```bash
pnpm run format:check
pnpm run lint          # limpo, sem --fix e sem eslint-disable
pnpm run typecheck
pnpm run test:e2e      # se tocou rota, banco ou token
pnpm run build
```

Se o schema mudou: `pnpm run db:generate`, revisar o `.sql` e commitar junto do `.schema.ts`.
</checklist>
