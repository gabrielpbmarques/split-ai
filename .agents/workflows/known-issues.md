---
description: Use when hitting an error, unexpected behavior or library limitation in split-ai (TypeORM, Nest, Fastify, Jest, LangChain/LangGraph, Voyage, bun), before investigating it, and after finishing any non-trivial investigation to register the outcome.
---

# Known problems and library workarounds

The register itself is `docs/problemas-conhecidos.md` (entries `PC-001`…). This skill is the protocol for reading and writing it. Architecture rules do not go there; they live in `.claude/rules/`. The register records the problem and links to the rule that resolves it.

## Protocol

<critical_rule>
When you hit an error, unexpected behavior or library limitation, follow the steps below before spending effort on investigation. When the investigation ends, register the outcome in the register in the same change as the code. A failed attempt that is not written down gets repeated by the next session.
</critical_rule>

<structure>
```
1. Look up      grep -n "<literal error fragment>" docs/problemas-conhecidos.md
                grep -n "<library name>" docs/problemas-conhecidos.md
2. Found        status contornado or atalho → apply the registered workaround; do not re-investigate
                status sem-solucao         → do not try again; follow the registered alternative
                library version changed    → check whether the entry still holds; update status and version
3. Not found    investigate following the "Workaround order" table
4. Concluded    add a new entry (template below), even when there is no solution
5. Removed      a workaround no longer needed → status obsoleto, with the version that fixed it
```
</structure>

<rules>
- Register when the investigation took more than one attempt: a non-obvious error, a cause outside the project's code, or a non-intuitive workaround.
- Register failed attempts too, under "Tentativas descartadas".
- "Sintoma" holds the literal error message, not a paraphrase: lookups are by `grep`.
- One entry per problem. An existing entry is updated, never duplicated.
- Ids are sequential (`PC-001`, `PC-002`…) and never reused.
- Code never references an entry through a comment (comments are a lint error). The link is the "Onde" field, with the file path.
- When upgrading a library listed in the register, review its entries.
</rules>

## Workaround order

| #   | Strategy                                                        | When                                                                                     |
| --- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1   | A public configuration or option of the library                 | Always the first attempt.                                                                |
| 2   | Helper code in the project (wrapper, adapter, util, provider)   | The library does not cover the case but exposes what is needed to cover it from outside. |
| 3   | The library's extension API (plugin, hook, subclass, decorator) | The gap is inside the library's flow and it offers an extension point.                   |
| 4   | Patch the library with `bun patch <pkg>` + `bun patch --commit` | No extension point exists. The patch lives in `patches/` and is versioned.               |
| 5   | Register as `sem-solucao` with the adopted alternative          | None of the above is viable at a reasonable cost.                                        |

<rules>
- Never edit a file inside `node_modules` except through `bun patch`.
- Never copy library code into the project (inline fork).
- A patch requires an entry with the exact library version; upgrading the version requires redoing the patch.
- Switching libraries is the requester's decision, not a workaround. Register the entry as `sem-solucao` and tell the requester.
</rules>

## Entry template

Entries are written in Portuguese, like the rest of `docs/`.

<structure>
```markdown
### PC-000 — <título curto: biblioteca + comportamento>

| Campo                  | Valor                                                             |
| ---------------------- | ----------------------------------------------------------------- |
| Status                 | contornado \| atalho \| sem-solucao \| obsoleto                   |
| Biblioteca             | `<pacote>@<versão exata>`                                         |
| Sintoma                | `<mensagem de erro literal ou comportamento observável>`          |
| Causa                  | <uma frase>                                                       |
| Solução                | <o que fazer, no imperativo>                                      |
| Onde                   | `<caminho/do/arquivo>`                                            |
| Regra dona             | `.claude/rules/<arquivo>.md` ou —                                 |
| Tentativas descartadas | <o que não funciona e por quê, uma frase cada> ou —               |
| Remover quando         | <condição objetiva para o contorno deixar de ser necessário> ou — |
| Registrado em          | AAAA-MM-DD                                                        |

```
</structure>

| Status | Meaning |
| --- | --- |
| `contornado` | A stable solution is applied. |
| `atalho` | The solution works but is provisional or has a known cost; describe the cost in "Solução". |
| `sem-solucao` | No viable solution; "Solução" describes the alternative or the constraint to respect. |
| `obsoleto` | No longer applies; "Remover quando" states the version that fixed it. Keep the entry. |
```
