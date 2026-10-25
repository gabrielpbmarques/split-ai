---
name: backend-coding
description: Regras, arquitetura modular, convenções NestJS, TypeORM, casos de uso, DTOs e boas práticas de backend no split-ai.
---

# Backend Coding Skill

Conjunto de regras em Markdown para agentes de IA implementarem e manterem backends NestJS (especialmente a arquitetura do split-ai).

## Estrutura de Regras

Os documentos detalhados ficam em `rules/`, relativo a este arquivo. Os números abaixo são o prefixo do nome do arquivo:

- `rules/00-visao-geral.md`: índice e stack tecnológica.
- `rules/01-topologia.md`: pastas, fronteiras de módulos e imports.
- `rules/02-convencoes-fundamentais.md`: convenções e regras de negócio.
- `rules/03-modulo-nest.md`: estrutura de módulos NestJS.
- `rules/04-anatomia-caso-de-uso.md`: controller, service e DTO por caso de uso.
- `rules/05-controllers-services-dtos.md`: convenções de classes e handlers.
- `rules/06-injecao-dependencia.md`: injeção de dependência e tokens.
- `rules/07-interceptors-decorators.md`: filtros, interceptors e decorators.
- `rules/08-autenticacao-autorizacao.md`: autenticação, JWT e permissões.
- `rules/09-banco-de-dados.md`: TypeORM, entidades e migrations.
- `rules/10-integracoes-externas.md`: provedores externos de IA e storage.
- `rules/11-fluxo-de-raciocinio-nova-funcionalidade.md`: ponto de entrada operacional; referencia os demais.
- `rules/12-problemas-conhecidos.md`: registro contínuo de travas e contornos de bibliotecas.

| Tema                                                    | Arquivo dono                            |
| ------------------------------------------------------- | --------------------------------------- |
| Exemplos completos de caso de uso                       | `rules/04-anatomia-caso-de-uso.md`      |
| Regras de controller, service, DTO, repositório, testes | `rules/05-controllers-services-dtos.md` |
| Tokens, portas, `ModuloBancoDeDados`                    | `rules/06-injecao-dependencia.md`       |
| Exceções, `ErrorResponse`, auditoria, logging, health   | `rules/07-interceptors-decorators.md`   |
| Guards, decorators de autorização, permissões           | `rules/08-autenticacao-autorizacao.md`  |
| Schema, exclusão lógica, transação, migration           | `rules/09-banco-de-dados.md`            |
| Fronteira entre domínios e regra de `join`              | `rules/02-convencoes-fundamentais.md`   |
| Travas, contornos e limitações de bibliotecas           | `rules/12-problemas-conhecidos.md`      |

## Invariantes Fundamentais

- Um caso de uso = um endpoint = um módulo Nest, com um controller, um service e seus DTOs.
- Controller expõe apenas `handle()`; service expõe apenas `execute()`.
- Resposta sempre via `@Res() res: FastifyReply`.
- Erros: exceções nativas do NestJS. Não existe hierarquia `AppError`.
- DTO HTTP usa `class-validator`; Zod só em `env.ts` e contratos de integração.
- Repositório é classe concreta, recebe `tx?: Executor` por último e nunca abre transação.
- Leitura pode fazer `join` entre domínios (dono = tabela do `FROM`); escrita nunca cruza domínio.
- Colunas de ciclo de vida: `created_at`, `updated_at`, `deleted_at` via `colunasCicloDeVida`; sem `DELETE` físico.
- Nomes: `XxxModule` para caso de uso e domínio; `ModuloXxx` para repositório e banco; `RepositorioXxx` para repositórios.
- Imports absolutos a partir de `src/`. Zero comentários no código (validado pelo lint).
