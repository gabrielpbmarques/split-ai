## O que muda

<!-- Uma frase com o objetivo. O que ficou fora do escopo. -->

## Plano

<!-- Link ou cole o plano no formato da skill `new-feature-flow` (Parte 2) que foi apresentado antes do código. Para correções pequenas, uma linha basta. -->

## Checklist (skill `new-feature-flow`, Parte 4)

- [ ] As 18 perguntas da skill `new-feature-flow` foram respondidas e o plano foi apresentado antes do código.
- [ ] Consumidores do código alterado foram mapeados (`grep`) e estão cobertos por teste.
- [ ] Cada caso de uso tem pasta própria com `handle()` e `execute()` únicos, registrado em `imports` **e** `exports` do módulo do domínio.
- [ ] Regra de negócio só em services; queries só em repositórios, com `tx?: Executor` por último; nenhuma escrita em tabela de outro domínio.
- [ ] Nenhum `forwardRef`, nenhum import de aggregator para alcançar um service, nenhum SDK/`fetch` fora de `src/infrastructure/integration/`.
- [ ] Schema alterado tem migration gerada contra um espelho de produção, revisada e commitada junto com a entidade (`bun run db:check`).
- [ ] Variável de ambiente nova está em `src/shared/config/env.ts` **e** em `.env.example`; nenhum segredo no diff.
- [ ] Rota nova tem `@Public()` ou `@RequirePermissions()`; nenhum escopo por organização/tenant reintroduzido sem decisão registrada.
- [ ] Nenhum comentário, `console.*`, `any` (fora de spec) ou `process.env` fora de `env.ts`.
- [ ] e2e em `test/<dominio>.e2e-spec.ts` cobrindo caminho feliz, 400, 401, 403 e 404 do caso de uso; spec unitário só para função pura.
- [ ] `bun run format:check && bun run lint && bun run typecheck && bun run test && bun run test:e2e && bun run build && bun run di:verify` sem erro.
- [ ] Toda trava investigada está registrada em `docs/problemas-conhecidos.md` (`PC-NNN`), resolvida ou não.
