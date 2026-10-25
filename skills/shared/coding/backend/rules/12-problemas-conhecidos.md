# Problemas conhecidos e contornos de bibliotecas

<uso>
- Registro contínuo de travas já investigadas: comportamento de biblioteca externa, contorno aplicado, atalho adotado ou problema sem solução.
- Consulte este arquivo antes de investigar qualquer trava. Registre aqui toda trava nova ao final da investigação, resolvida ou não.
- Regra de arquitetura não entra aqui; entra no arquivo dono. Aqui entra o problema e o link para a regra que o resolve.
</uso>

## Protocolo

<regra critica="true">
Ao encontrar erro, comportamento inesperado ou limitação de biblioteca, siga a ordem abaixo antes de gastar esforço de investigação. Ao concluir a investigação, registre o resultado neste arquivo no mesmo PR da mudança de código.
</regra>

<fluxo>
```
1. Consultar    grep -n "<trecho literal do erro>" 12-problemas-conhecidos.md
                grep -n "<nome-da-biblioteca>" 12-problemas-conhecidos.md
2. Encontrou    status contornado ou atalho → aplicar o contorno registrado; não reinvestigar
                status sem-solucao         → não tentar de novo; seguir a alternativa registrada
                versão da lib mudou        → testar se a entrada ainda vale; atualizar status e versão
3. Não achou    investigar na ordem da tabela "Ordem de contorno"
4. Concluiu     registrar entrada nova (modelo abaixo), inclusive quando não houver solução
5. Removeu      contorno que deixou de ser necessário → status obsoleto, com a versão que corrigiu
```
</fluxo>

<regras>
- Registre quando a investigação passar de uma tentativa: erro não óbvio, causa fora do código do projeto, ou contorno não intuitivo.
- Registre também tentativa que falhou, em "Tentativas descartadas". É isso que impede a próxima sessão de repetir o caminho.
- "Sintoma" contém o texto literal da mensagem de erro, sem parafrasear. A busca é por `grep`.
- Uma entrada por problema. Problema já registrado é atualizado, não duplicado.
- O identificador é sequencial (`PC-001`, `PC-002`…) e nunca é reaproveitado.
- O código do contorno não referencia a entrada por comentário. O vínculo é o campo "Onde", com o caminho do arquivo.
- Ao atualizar versão de biblioteca listada aqui, revise as entradas dela.
</regras>

## Ordem de contorno

<tabela>

| #   | Estratégia                                                                      | Quando usar                                                                   |
| --- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | Configuração ou opção pública da biblioteca                                     | Sempre a primeira tentativa.                                                  |
| 2   | Código auxiliar no projeto (wrapper, adapter, função utilitária, provider)      | A biblioteca não cobre o caso, mas expõe o necessário para cobri-lo por fora. |
| 3   | Extensão por API de extensão da biblioteca (plugin, hook, subclasse, decorator) | O gap está dentro do fluxo da biblioteca e ela oferece ponto de extensão.     |
| 4   | Patch da biblioteca com `pnpm patch` + `pnpm patch-commit`                      | Não há ponto de extensão. O patch fica em `patches/` e é versionado.          |
| 5   | Registrar como `sem-solucao` com a alternativa adotada                          | Nenhuma das anteriores é viável sem custo desproporcional.                    |

</tabela>

<regras>
- Proibido editar arquivo dentro de `node_modules` sem `pnpm patch`.
- Proibido copiar código da biblioteca para dentro do projeto (fork inline).
- Patch com `pnpm patch` exige entrada aqui com versão exata da biblioteca; atualizar a versão exige refazer o patch.
- Trocar de biblioteca é decisão do time, não contorno. Registre a entrada como `sem-solucao` e informe ao solicitante.
</regras>

## Modelo de entrada

<estrutura>
```markdown
### PC-000 — <título curto: biblioteca + comportamento>

| Campo                  | Valor                                                             |
| ---------------------- | ----------------------------------------------------------------- |
| Status                 | contornado \| atalho \| sem-solucao \| obsoleto                   |
| Biblioteca             | `<pacote>@<versão exata>`                                         |
| Sintoma                | `<mensagem de erro literal ou comportamento observável>`          |
| Causa                  | <uma frase>                                                       |
| Solução                | <o que fazer, em modo imperativo>                                 |
| Onde                   | `<caminho/do/arquivo>`                                            |
| Regra dona             | [`NN-arquivo.md`](NN-arquivo.md) ou —                             |
| Tentativas descartadas | <o que não funciona e por quê, em uma frase cada> ou —            |
| Remover quando         | <condição objetiva para o contorno deixar de ser necessário> ou — |
| Registrado em          | AAAA-MM-DD                                                        |

```
</estrutura>

<tabela>

| Status | Significado |
| --- | --- |
| `contornado` | Existe solução aplicada e estável. |
| `atalho` | Solução funciona mas é provisória ou tem custo conhecido; descreva o custo em "Solução". |
| `sem-solucao` | Não há solução viável; "Solução" descreve a alternativa ou a restrição a respeitar. |
| `obsoleto` | Não se aplica mais; "Remover quando" indica a versão que corrigiu. Mantenha a entrada. |

</tabela>

## Registro

### PC-001 — Middleware do Nest sob Fastify recebe `req.url` relativo ao mount

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `@nestjs/platform-fastify@11` + `fastify@5.11.3` |
| Sintoma | Middleware lê `req.url` e recebe o caminho sem o prefixo de rota onde foi montado. |
| Causa | O adapter Fastify do Nest monta middleware via `@fastify/middie`, que reescreve `req.url` relativo ao mount. |
| Solução | Use `req.originalUrl` para obter o caminho completo dentro de middleware. |
| Onde | Middlewares em `src/shared/` |
| Regra dona | — |
| Tentativas descartadas | — |
| Remover quando | — |
| Registrado em | 2026-10-02 |

### PC-002 — Vitest não emite metadata de decorator e a DI do Nest falha silenciosamente

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `vitest@4.1.11` + `unplugin-swc@1.5.11` |
| Sintoma | Dependência injetada por construtor chega `undefined` nos testes, sem erro de compilação. |
| Causa | O esbuild padrão do Vitest não suporta `emitDecoratorMetadata`. |
| Solução | Use `unplugin-swc` com `legacyDecorator` e `decoratorMetadata` ligados, lidos do `tsconfig.json` pela opção `tsconfigFile`. |
| Onde | `vitest.config.ts`, `vitest.unit.config.ts` |
| Regra dona | [`01-topologia.md`](01-topologia.md) |
| Tentativas descartadas | Usar o transformador padrão do Vitest: não emite metadata. |
| Remover quando | — |
| Registrado em | 2026-10-02 |

### PC-003 — `injectable-should-be-provided` acusa todo provider em workspace multi-root

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `@darraghor/eslint-plugin-nestjs-typed@7.3.4` + `eslint-plugin-import-x@4.17.1` |
| Sintoma | `found 0 references ()` em todo provider, com os parênteses vazios. |
| Causa | A opção `src` da regra e o `project` do resolver de imports são resolvidos contra `process.cwd()`, que no editor não é a raiz do projeto. Parênteses vazios significam "nenhum módulo encontrado". |
| Solução | Use caminho absoluto a partir de `import.meta.dirname` nas duas opções. |
| Onde | `eslint.config.mjs` |
| Regra dona | [`01-topologia.md`](01-topologia.md) |
| Tentativas descartadas | Procurar o provider faltando no módulo: o provider não está faltando. |
| Remover quando | — |
| Registrado em | 2026-10-02 |

### PC-004 — `nest build` emite só o `main.js`

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `@nestjs/cli@11.0.24` + `typescript` |
| Sintoma | `dist/` contém apenas `main.js` após `nest build`. |
| Causa | `incremental: true` mantém o `.tsbuildinfo`, e `deleteOutDir: true` apaga a saída; o compilador considera o resto atualizado e não emite. |
| Solução | Desative `incremental` em `tsconfig.build.json`. Mantenha `incremental` no `tsconfig.json` de desenvolvimento. |
| Onde | `tsconfig.build.json`, `nest-cli.json` |
| Regra dona | [`01-topologia.md`](01-topologia.md) |
| Tentativas descartadas | Desligar `deleteOutDir`: deixa artefatos antigos em `dist/`. |
| Remover quando | — |
| Registrado em | 2026-10-02 |

### PC-005 — Rota registrada direto no Fastify não passa pelos guards do Nest

| Campo | Valor |
| --- | --- |
| Status | sem-solucao |
| Biblioteca | `fastify@5.11.3` + `@nestjs/platform-fastify@11` |
| Sintoma | Rota de Swagger, `@fastify/static` ou plugin Fastify responde sem autenticação. |
| Causa | Guards do Nest só envolvem handlers de controller; a instância do Fastify roteia por fora. |
| Solução | Quem registra a rota na instância do Fastify protege a rota no próprio registro (hook `onRequest` ou desligamento fora de desenvolvimento). |
| Onde | `src/main.ts` |
| Regra dona | [`01-topologia.md`](01-topologia.md) |
| Tentativas descartadas | Esperar que `APP_GUARD` cubra a rota: não cobre. |
| Remover quando | — |
| Registrado em | 2026-10-02 |

### PC-006 — `import type` em dependência de construtor quebra a injeção em runtime

| Campo | Valor |
| --- | --- |
| Status | sem-solucao |
| Biblioteca | `typescript` + `@nestjs/core@11.2.3` |
| Sintoma | Dependência chega `undefined` ou o Nest não resolve o provider, sem erro de compilação. |
| Causa | `import type` é apagado na compilação e a metadata do parâmetro vira `Object`. |
| Solução | Use import normal para classe injetada por construtor sem `@Inject(TOKEN)`. |
| Onde | Qualquer `*.service.ts`, `*.controller.ts` ou provider |
| Regra dona | [`02-convencoes-fundamentais.md`](02-convencoes-fundamentais.md) |
| Tentativas descartadas | — |
| Remover quando | — |
| Registrado em | 2026-10-02 |

### PC-007 — Drizzle não tipa `select(Pick<colunas, TCampo>)` como `Pick<Linha, TCampo>`

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `drizzle-orm@0.45.2` |
| Sintoma | `Conversion of type 'SelectResult<...>' to type 'Pick<{...}, K>[]' may be a mistake because neither type sufficiently overlaps with the other` |
| Causa | `SelectResult` é um tipo mapeado sobre `TSelection`; com `TCampo` genérico o compilador não reduz o mapeamento até `Pick<Linha, TCampo>`. Com `join` o resultado ainda passa por `AppendToResult`, e nem o `as` simples é aceito. |
| Solução | Sem `join`: `return linhas as Pick<Linha, TCampo>[]`. Com `join` ou `leftJoinLateral`: `as unknown as Pick<Linha, TCampo>[]`. Quando o `join` era só para filtrar por tabela associativa, troque por `where(inArray(tabela.id, subquery))` e use o `as` simples. |
| Onde | `src/infrastructure/database/selecao-campos.ts`, `src/modules/**/repositories/*.repository.ts` |
| Regra dona | [`09-banco-de-dados.md`](09-banco-de-dados.md#projeção-e-listagem) |
| Tentativas descartadas | Atribuir a `const linhas: Pick<Linha, TCampo>[]` falha com o mesmo erro; `innerJoin` com `select(selecionarColunas(...))` não aceita nem o `as` simples. |
| Remover quando | Versão do `drizzle-orm` passar a inferir `SelectResult<Pick<...>>` como comparável a `Pick<Linha, TCampo>`. |
| Registrado em | 2026-10-02 |
```
