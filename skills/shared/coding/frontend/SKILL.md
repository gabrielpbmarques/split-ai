---
name: frontend-coding
description: Regras, padrões de arquitetura, convenções de componentes, formulários, design system e acessibilidade para desenvolvimento de frontend React.
---

# Frontend Coding Skill

Conjunto de regras em Markdown para agentes de IA implementarem e manterem frontends React/TypeScript (como o split-client).

## Estrutura de Regras

Os documentos de referência ficam em `rules/`, relativo a este arquivo:

- `rules/00-visao-geral.md`: visão geral, índice e stack.
- `rules/01-topologia.md`: pastas, `main.tsx`, providers e ferramentas.
- `rules/02-convencoes-fundamentais.md`: fronteiras de import, idioma, comentários e tipagem.
- `rules/03-anatomia-da-pagina.md`: exemplo completo de página e receita de criação.
- `rules/04-dados-do-servidor.md`: cliente HTTP, contratos, chaves de cache e mutações.
- `rules/05-design-system-e-estilo.md`: design system, camada `shared/ui`, ícones e tokens.
- `rules/06-padroes-de-tela.md`: estados de carregando/erro/vazio, tabelas, filtros e detalhe.
- `rules/07-formularios-e-acoes.md`: formulários, validação, ações e diálogos de confirmação.
- `rules/08-acessibilidade.md`: foco, nome acessível, anúncios de leitor de tela e WCAG.
- `rules/09-autenticacao-e-permissoes.md`: sessão, tokens, permissões e rotas protegidas.
- `rules/10-prototipo-e-simulacao.md`: flags de ambiente, simulação e `DECISAO-PENDENTE`.
- `rules/11-tutorial-guiado.md`: registro de tour e jornada guiada.
- `rules/12-testes.md`: helpers de teste, testes unitários e de componentes.
- `rules/13-fluxo-de-raciocinio-nova-funcionalidade.md`: passo a passo para novas features.
- `rules/14-problemas-conhecidos.md`: catálogo de travas e contornos de bibliotecas.

| Tema                                          | Arquivo dono                            |
| --------------------------------------------- | --------------------------------------- |
| Pastas, providers, ambiente, ferramentas      | `rules/01-topologia.md`                 |
| Fronteiras de import, nomenclatura, tipagem   | `rules/02-convencoes-fundamentais.md`   |
| Exemplo completo de página e receita          | `rules/03-anatomia-da-pagina.md`        |
| Cliente HTTP, consultas, mutações, erros      | `rules/04-dados-do-servidor.md`         |
| Camada `shared/ui`, ícones, Tailwind e tokens | `rules/05-design-system-e-estilo.md`    |
| Estados de carregando/erro/vazio, listas      | `rules/06-padroes-de-tela.md`           |
| Formulários, validação, ações do servidor     | `rules/07-formularios-e-acoes.md`       |
| Acessibilidade (foco, aria, navegação)        | `rules/08-acessibilidade.md`            |
| Permissões, contexto e rotas protegidas       | `rules/09-autenticacao-e-permissoes.md` |
| Travas, contornos e limitações de bibliotecas | `rules/14-problemas-conhecidos.md`      |

## Invariantes Fundamentais

- Componente é Server Component por padrão (no App Router) ou `export function` sem `export default` (exceto páginas de convenção).
- Toda chamada à API sai por funções dedicadas de `api.ts`.
- Sem estado global desnecessário; estado de servidor vem de Server Components / queries e estado efêmero é `useState` na folha.
- Regra pura de cálculo, filtro, ordenação ou conversão fica em `regras.ts` com spec ao lado.
- Acessibilidade WCAG 2.1 AA em todo componente interativo (nome acessível, foco e contraste).
