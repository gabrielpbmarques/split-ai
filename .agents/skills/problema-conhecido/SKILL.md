---
name: problema-conhecido
description: 'Consulta e registra travas de bibliotecas e do runtime (TypeORM, NestJS, Fastify, Jest, LangChain/LangGraph, Voyage AI, bun) em .agents/rules/12-problemas-conhecidos.md. Use antes de investigar qualquer erro inesperado ou limitação de biblioteca e ao concluir uma investigação não trivial.'
---

# Problemas conhecidos e contornos de bibliotecas

O catálogo vive em `.agents/rules/12-problemas-conhecidos.md` (entradas `PC-001` a `PC-020`…). Esta skill define o protocolo para consultá-lo e atualizá-lo. Regras de arquitetura não moram apenas lá: elas moram no arquivo de regra dono em `.agents/rules/NN-*.md`, e a entrada `PC-NNN` registra o problema técnico e aponta para a regra dona.

## Protocolo

<regra critica="true">
Ao encontrar um erro, comportamento inesperado ou limitação de biblioteca, siga os passos abaixo **antes** de gastar esforço investigando por tentativa e erro. Quando a investigação terminar, registre o resultado em `.agents/rules/12-problemas-conhecidos.md` no mesmo trabalho do código. Uma tentativa descartada que não é documentada será repetida na próxima sessão.
</regra>

<fluxo>
```
1. Consultar    grep -n "<trecho literal do erro>" .agents/rules/12-problemas-conhecidos.md
                grep -n "<nome da biblioteca>" .agents/rules/12-problemas-conhecidos.md
2. Encontrou    status contornado ou atalho → aplique a solução registrada; não re-investigue
                status sem-solucao         → não tente de novo; siga a alternativa registrada
                versão da biblioteca mudou → verifique se a trava ainda vale; atualize status e versão
3. Não achou    investigue seguindo a tabela "Ordem de contorno" em 12-problemas-conhecidos.md
4. Concluiu     adicione uma nova entrada (modelo abaixo), mesmo quando o resultado for sem-solucao
5. Removeu      contorno deixou de ser necessário → mude o status para obsoleto indicando a versão que corrigiu
```
</fluxo>

<regras>
- Registre sempre que a investigação exigir mais de uma tentativa: erro não óbvio, causa fora do código do projeto ou contorno contraintuitivo.
- Registre também o que **não** funcionou no campo `Tentativas descartadas`, com o motivo em uma frase.
- `Sintoma` guarda a mensagem de erro **literal** ou comportamento exato observável, nunca uma paráfrase (para que futuras buscas com `grep` encontrem).
- Uma entrada por problema. Se o problema já existir no catálogo, atualize a entrada existente em vez de duplicá-la.
- Os códigos `PC-NNN` são sequenciais (`PC-001`, `PC-002`…) e nunca são reutilizados.
- O código-fonte nunca referencia um `PC-NNN` por comentário (comentários em `src/` quebram o lint). O vínculo é feito pelo campo `Onde` na tabela da entrada.
- Ao atualizar a versão de qualquer biblioteca listada no catálogo, revise todas as entradas dela.
</regras>

## Modelo de entrada

Adicione no final de `.agents/rules/12-problemas-conhecidos.md`:

<estrutura>
```markdown
### PC-000 — <título curto: biblioteca + comportamento>

| Campo                  | Valor                                                             |
| ---------------------- | ----------------------------------------------------------------- |
| Status                 | contornado \| atalho \| sem-solucao \| obsoleto \| resolvido      |
| Biblioteca             | `<pacote>@<versão exata>`                                         |
| Sintoma                | `<mensagem de erro literal ou comportamento observável>`          |
| Causa                  | <uma frase direta>                                                |
| Solução                | <o que fazer, no imperativo>                                      |
| Onde                   | `<caminho/do/arquivo>`                                            |
| Regra dona             | `.agents/rules/<NN-arquivo>.md` ou —                              |
| Tentativas descartadas | <o que não funciona e por quê, uma frase cada> ou —               |
| Remover quando         | <condição objetiva para o contorno deixar de ser necessário> ou — |
| Registrado em          | AAAA-MM-DD                                                        |

```
</estrutura>

<tabela>

| Status | Significado |
| --- | --- |
| `contornado` | Solução estável aplicada dentro das regras da arquitetura. |
| `atalho` | Funciona, mas é provisório ou tem custo conhecido (ex.: cast tipado); descreva o custo em `Solução`. |
| `sem-solucao` | Não há solução técnica viável na biblioteca; `Solução` descreve a alternativa operacional ou restrição a respeitar. |
| `resolvido` | Causa raiz de infraestrutura/banco corrigida em definitivo, mantida como histórico de diagnóstico. |
| `obsoleto` | Não se aplica mais; `Remover quando` registra a versão ou data em que deixou de existir. Mantenha a entrada no histórico. |

</tabela>
```
