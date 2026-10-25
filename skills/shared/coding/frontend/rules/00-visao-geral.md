# Regras de frontend React

<papel>
Você é um engenheiro frontend sênior implementando e mantendo uma SPA React com TypeScript. Siga estes documentos como a especificação do projeto.
</papel>

<uso>
- Funcionalidade nova: siga [`13-fluxo-de-raciocinio-nova-funcionalidade.md`](13-fluxo-de-raciocinio-nova-funcionalidade.md).
- Página nova: copie a forma de [`03-anatomia-da-pagina.md`](03-anatomia-da-pagina.md).
- Dúvida pontual: consulte o índice abaixo.
- Trava, erro inesperado ou limitação de biblioteca: consulte [`14-problemas-conhecidos.md`](14-problemas-conhecidos.md) antes de investigar.
- Padrão documentado aqui vence qualquer alternativa inventada.
- Antes de criar componente, hook ou função, procure um equivalente em `src/shared/ui/`, `src/shared/hooks/`, `src/shared-domain/` e na página. Reutilize.
- Nenhuma abstração, camada ou dependência nova sem necessidade concreta e atual.
</uso>

<indice>

| Documento                                                                                        | Cobre                                                                                                                 |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| [`01-topologia.md`](01-topologia.md)                                                             | Estrutura de pastas, `main.tsx`, árvore de providers, variáveis de ambiente, ferramentas, verificação                 |
| [`02-convencoes-fundamentais.md`](02-convencoes-fundamentais.md)                                 | Página = rota, promoção para `shared-domain`, fronteiras de import, idioma, nomenclatura, comentários, tipagem        |
| [`03-anatomia-da-pagina.md`](03-anatomia-da-pagina.md)                                           | Exemplo completo de página (lista, filtro, detalhe, escrita) e receita de criação                                     |
| [`04-dados-do-servidor.md`](04-dados-do-servidor.md)                                             | Cliente HTTP, contratos, `api.ts`, consultas, chaves, escritas, invalidação, erros de API                             |
| [`05-design-system-e-estilo.md`](05-design-system-e-estilo.md)                                   | Import do DS, camada `shared/ui`, pontes, inventário de componentes, ícones, Tailwind e tokens                        |
| [`06-padroes-de-tela.md`](06-padroes-de-tela.md)                                                 | `Page`, cabeçalho, estados de carregamento/erro/vazio, lista com filtros na URL, tabela, detalhe em rota ou em drawer |
| [`07-formularios-e-acoes.md`](07-formularios-e-acoes.md)                                         | Formulário em diálogo, validação local e do servidor, `BotaoAcao`, confirmação, justificativa, avisos                 |
| [`08-acessibilidade.md`](08-acessibilidade.md)                                                   | Foco depois de ação, nome acessível, anúncio, `sr-only`, critérios WCAG 2.1                                           |
| [`09-autenticacao-e-permissoes.md`](09-autenticacao-e-permissoes.md)                             | Token, sessão expirada, `/me`, contexto ativo, permissões efetivas, destinos, rotas protegidas, 403                   |
| [`10-prototipo-e-simulacao.md`](10-prototipo-e-simulacao.md)                                     | Modos de ambiente, servidor simulado no navegador, rotas simuladas, seed, `DECISAO-PENDENTE`                          |
| [`11-tutorial-guiado.md`](11-tutorial-guiado.md)                                                 | `tour.ts`, alvos com `idDoTour`, registro do tour, jornada do fluxo inicial                                           |
| [`12-testes.md`](12-testes.md)                                                                   | Vitest + Testing Library, helpers de render, transporte, mocks de ambiente, testes de integração                      |
| [`13-fluxo-de-raciocinio-nova-funcionalidade.md`](13-fluxo-de-raciocinio-nova-funcionalidade.md) | Perguntas obrigatórias antes de codar, estrutura do plano de implementação e ordem de implementação                   |
| [`14-problemas-conhecidos.md`](14-problemas-conhecidos.md)                                       | Protocolo e registro contínuo de travas, contornos e limitações de bibliotecas                                        |

</indice>

<stack>

| Camada                              | Escolha                                                                                             |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- |
| Biblioteca de UI                    | React 19 (`StrictMode`)                                                                             |
| Linguagem                           | TypeScript estrito                                                                                  |
| Build e servidor de desenvolvimento | Vite (porta fixa 5173)                                                                              |
| Roteamento                          | `react-router-dom` (`BrowserRouter`, `Routes`)                                                      |
| Estado de servidor                  | `@tanstack/react-query`                                                                             |
| Componentes                         | Design System institucional `@pucpr-ds/react` + tokens `@pucpr-ds/tokens`, sempre via `@/shared/ui` |
| Primitivos de ponte                 | `radix-ui`, só dentro de `src/shared/ui/`                                                           |
| Estilo                              | Tailwind CSS v4 (`@tailwindcss/vite`) com tokens do DS mapeados em `@theme`                         |
| Ícones                              | Font Awesome (`@fortawesome/free-solid-svg-icons`), só via `<Icone>`                                |
| Autenticação                        | MSAL (`@azure/msal-react`), OIDC + PKCE, token Bearer em cada chamada                               |
| Tutorial guiado                     | `nextstepjs` + `motion`, só no modo protótipo                                                       |
| Fontes                              | `@fontsource/poppins` e `@fontsource-variable/source-sans-3`, sem CDN                               |
| Testes                              | Vitest + `jsdom` + `@testing-library/react` + `@testing-library/user-event`                         |
| Lint e formatação                   | ESLint (`typescript-eslint`) + Prettier                                                             |
| Gerenciador de pacotes              | pnpm                                                                                                |

</stack>
