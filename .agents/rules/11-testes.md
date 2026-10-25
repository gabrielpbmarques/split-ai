---
trigger: glob
description: 'Testes (Jest): camadas unitária vs. e2e, harness createTestApp(), banco de teste e critérios de qualidade.'
globs: 'test/**, src/**/*.spec.ts'
---

# Testes

Cobre: as duas camadas de teste, o harness e2e e o que um teste pode ou não fazer. O executor de testes é o **Jest** (`ts-jest`), um desvio consciente em relação ao Vitest da especificação base (`00-projeto.md`).

## As duas camadas de teste

<regras>
- **Spec unitária (`src/**/*.spec.ts`, ao lado do arquivo testado):** exclusivamente para funções puras e módulos autocontidos: mappers, `http-client`, `permissions`, `TokenVerifier`, `VoyageRerankCompressor`, provedores (`*.provider.spec.ts`), `utils`, além das duas specs de camada HTTP/Auth (`auth-layer.spec.ts` e `http-layer.spec.ts`). Arquivos `*.spec.ts` podem usar `any`; nenhum outro arquivo pode.
- **Spec e2e (`test/<domain>.e2e-spec.ts`, um arquivo por domínio):** testa os casos de uso de ponta a ponta. **Não** crie spec unitária de service que faça mock de repositório ou de outro service do Nest; esse comportamento pertence ao arquivo e2e do domínio.
- Todo caso de uso com rota HTTP deve ter cobertura no e2e do seu domínio: caminho feliz (`200`/`201`/`202`/`204`), `400` com `details` (validação de DTO), `401` (sem token), `403` (usuário sem a permissão exigida) e `404` (recurso inexistente, quando aplicável). Um novo endpoint adiciona blocos `it(...)` ao arquivo `test/<domain>.e2e-spec.ts` existente, em vez de criar um novo arquivo de teste.
</regras>

## Harness de testes e2e (`test/support/`)

<regras>
- Inicialize a aplicação sempre por meio de `createTestApp()` (`test/support/test-app.ts`): sobe o `AppModule` real sobre o Fastify usando a mesma factory de adaptador (`createFastifyAdapter()`) e o mesmo `ValidationPipe` (`createValidationPipe()`) do `main.ts`. Nunca monte um módulo ou aplicativo paralelo apenas para testes.
- Limpe o estado com `await t.reset()` no `beforeEach` (trunca todas as tabelas do banco de teste); construa dados com as factories de `test/support/factories.ts` e gere cabeçalhos de autenticação com `bearer(user)`.
- As specs e2e rodam em série (`--runInBand`) contra um único banco de dados preparado por `test/global-setup.ts`.
- O banco de teste vem de `TEST_DATABASE_URL` (container de serviço `postgres:16-alpine` na CI, ou `docker compose up postgres` localmente), com fallback para Testcontainers quando o Docker estiver disponível. O script `scripts/test/prepare-database.ts` sincroniza o schema a partir das entidades TypeORM e insere os registros das migrations na tabela `migrations` como aplicadas (PC-017).
- O ambiente de teste é hermético (`test/setup-env.ts`): aponta `DOTENV_CONFIG_PATH` para fora do `.env`, força `INTEGRATION_MODE=mock`, desativa o tracing do LangSmith e fixa valores determinísticos como `JWT_SECRET`. Uma spec que dependa de variável de ambiente deve aferir o valor fixado em `setup-env.ts`, nunca o `.env` ou o shell do desenvolvedor.
- Integrações externas rodam em modo mock (`INTEGRATION_MODE=mock`): faça asserções sobre os efeitos observáveis (linhas gravadas no banco, eventos NDJSON recebidos, status HTTP), nunca contra serviços externos reais.
</regras>

## O que define um bom teste

<regras>
- O nome do teste (`it('...')`) descreve o comportamento esperado de negócio/HTTP, não o nome do método chamado. A intenção do teste vai no texto do `it(...)` (comentários são proibidos pelo linter).
- Cubra caminhos de erro e casos de borda das regras, não apenas o caminho feliz.
- Testes não podem depender da ordem de execução de outros testes.
- Não escreva testes unitários apenas para testar a injeção de dependência do framework; `bun run di:verify && bun run di:boot-check` já fazem essa verificação para toda a aplicação.
- Quando um teste passar a falhar após uma alteração, corrija o código. Se o próprio teste estiver desatualizado por mudança legítima de requisito, informe o solicitante e atualize a asserção de acordo com o novo contrato. Nunca apague, pule (`it.skip`) ou enfraqueça um teste apenas para fazê-lo passar.
- A implementação deve atender a qualquer entrada válida, nunca conter valores chumbados (hard-coded) apenas para satisfazer o caso de teste.
</regras>
