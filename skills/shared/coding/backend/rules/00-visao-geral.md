# Regras de backend NestJS

<papel>
Você é um engenheiro backend sênior implementando e mantendo uma API NestJS. Siga estes documentos como a especificação do projeto.
</papel>

<uso>
- Funcionalidade nova: siga [`11-fluxo-de-raciocinio-nova-funcionalidade.md`](11-fluxo-de-raciocinio-nova-funcionalidade.md).
- Dúvida pontual: consulte o índice abaixo.
- Trava, erro inesperado ou limitação de biblioteca: consulte [`12-problemas-conhecidos.md`](12-problemas-conhecidos.md) antes de investigar.
- Padrão documentado aqui vence qualquer alternativa inventada.
- Nenhuma abstração, camada ou dependência nova sem necessidade concreta e atual.
</uso>

<indice>

| Documento                                                                                        | Cobre                                                                                                                                  |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| [`01-topologia.md`](01-topologia.md)                                                             | Estrutura de pastas, bootstrap, configuração de ambiente, ferramentas                                                                  |
| [`02-convencoes-fundamentais.md`](02-convencoes-fundamentais.md)                                 | Módulo = domínio, caso de uso = ação, fronteiras, idioma, nomenclatura                                                                 |
| [`03-modulo-nest.md`](03-modulo-nest.md)                                                         | Os três papéis de um `*.module.ts`                                                                                                     |
| [`04-anatomia-caso-de-uso.md`](04-anatomia-caso-de-uso.md)                                       | Exemplo completo de caso de uso (mutação e leitura) e receita de criação                                                               |
| [`05-controllers-services-dtos.md`](05-controllers-services-dtos.md)                             | Regras de controller, service, DTO e repositório                                                                                       |
| [`06-injecao-dependencia.md`](06-injecao-dependencia.md)                                         | Classe concreta vs. `Symbol` + factory vs. porta (`useExisting`)                                                                       |
| [`07-interceptors-decorators.md`](07-interceptors-decorators.md)                                 | Abstrações transversais, auditoria, filtro de exceção, erros, decorators, logging                                                      |
| [`08-autenticacao-autorizacao.md`](08-autenticacao-autorizacao.md)                               | Guards globais, verificação de token, permissões, escopo de acesso                                                                     |
| [`09-banco-de-dados.md`](09-banco-de-dados.md)                                                   | Schema, projeção e listagem (`campos` no `select`, sem `map` em memória), conexão, exclusão lógica, transação, concorrência, migration |
| [`10-integracoes-externas.md`](10-integracoes-externas.md)                                       | Conector → contrato → mapeador → domínio, cliente HTTP resiliente                                                                      |
| [`11-fluxo-de-raciocinio-nova-funcionalidade.md`](11-fluxo-de-raciocinio-nova-funcionalidade.md) | Perguntas obrigatórias antes de codar, estrutura do plano de implementação e ordem de implementação                                    |
| [`12-problemas-conhecidos.md`](12-problemas-conhecidos.md)                                       | Protocolo e registro contínuo de travas, contornos e limitações de bibliotecas                                                         |

</indice>

<stack>

| Camada                                      | Escolha                                                              |
| ------------------------------------------- | -------------------------------------------------------------------- |
| Framework                                   | NestJS                                                               |
| Adapter HTTP                                | Fastify (`@nestjs/platform-fastify`)                                 |
| Banco / ORM                                 | PostgreSQL + Drizzle ORM + driver `pg`                               |
| Validação de DTO HTTP                       | `class-validator` + `class-transformer`                              |
| Validação de ambiente e de contrato externo | Zod                                                                  |
| Autenticação                                | Token Bearer (JWT) emitido por IdP externo, verificado localmente    |
| Testes                                      | Vitest + `unplugin-swc` (`decoratorMetadata: true`) + Testcontainers |
| Logging                                     | `nestjs-pino`                                                        |
| Documentação de API                         | `@nestjs/swagger` com plugin do `nest-cli`                           |
| Gerenciador de pacotes                      | pnpm                                                                 |

</stack>
