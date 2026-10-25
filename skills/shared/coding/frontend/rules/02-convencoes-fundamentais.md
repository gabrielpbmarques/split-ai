# Convenções fundamentais

## Página = tela, regra compartilhada = `shared-domain`

<regras>
- Uma tela = uma pasta em `src/pages/<pagina>/`, com a forma fixa de [`03-anatomia-da-pagina.md`](03-anatomia-da-pagina.md).
- Lista e detalhe em rota própria são duas páginas: `pedidos` (lista, `/pedidos`) e `pedido` (detalhe, `/pedidos/:id`). Detalhe em drawer pertence à página da lista. Escolha entre os dois: [`06-padroes-de-tela.md`](06-padroes-de-tela.md).
- Nenhum nível de sub-módulo dentro da página, mesmo que ela cresça. `components/` é plano.
- Regra de negócio, tipo, rótulo ou componente usado por uma página fica dentro dela.
- No momento em que uma segunda página precisa, mova para `src/shared-domain/<assunto>/` no mesmo PR e troque os imports das duas.
- `shared-domain/<assunto>/` tem a mesma forma de uma página (`types.ts`, `api.ts`, `hooks.ts`, `components/`, `index.ts`), mais arquivos de regra pura nomeados pelo assunto (`rotulos.ts`, `erros.ts`, `consultas.ts`, `regras.ts`).
- Componente genérico, sem regra de negócio e sem estado de sessão: `src/shared/ui/`. Ver [`05-design-system-e-estilo.md`](05-design-system-e-estilo.md).
- Hook genérico sem regra de negócio: `src/shared/hooks/useAlgo.ts`.
- Tipo de request/response da API: `src/shared/contracts/<assunto>.ts`. Ver [`04-dados-do-servidor.md`](04-dados-do-servidor.md).
- Selo, badge ou texto com regra de negócio (tom por estado de domínio) não mora em `shared/ui/`: mora na página ou em `shared-domain/`.
</regras>

## Fronteiras de import

<regra critica="true">
Uma página nunca importa arquivo de outra página. Só `src/app/routes.tsx` importa de `@/pages/<pagina>`, e sempre pelo `index.ts`. O que duas páginas compartilham sobe para `shared-domain/` ou `shared/`.

Import entre páginas acopla telas, cria ciclo e faz a mudança de uma tela quebrar outra.
</regra>

<tabela>

| Quem importa               | Pode importar                                                                                                   | Nunca importa                                                                                                            |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `pages/<p>/`               | `@/api`, `@/auth`, `@/config`, `@/shared-domain/*` (pelo `index.ts`), `@/shared/*`, a própria pasta             | outra página, `@/app`, `@/simulacao`, `@/test`, `@pucpr-ds/react`, `radix-ui`, `@radix-ui/*`, `@fortawesome/*`           |
| `shared-domain/<assunto>/` | `@/api`, `@/auth`, `@/config`, outro `@/shared-domain/*`, `@/shared/*`, a própria pasta                         | `@/pages`, `@/app`, `@/simulacao`, `@/test`, DS, Radix, Font Awesome                                                     |
| `shared/ui/`               | `@pucpr-ds/react`, `radix-ui`, `@/shared/contracts`, `@/shared/constants`                                       | `@/pages`, `@/app`, `@/auth`, `@/api`, `@/shared-domain`, `@/simulacao`, `@/test`, `@fortawesome/*` (exceto `Icone.tsx`) |
| `shared/` (demais)         | `@/shared/*`                                                                                                    | `@/pages`, `@/app`, `@/auth`, `@/api`, `@/shared-domain`, `@/simulacao`, `@/test`                                        |
| `app/`                     | tudo, menos `@/simulacao` e `@/test`                                                                            | `@/simulacao` (exceto `main.tsx`), `@/test`, DS direto                                                                   |
| `auth/`, `api/`, `config/` | `@/shared/*`, `@/config`, `@/api`, `@/auth`, `@/shared-domain/acesso`                                           | `@/pages`, `@/app`, `@/simulacao`, `@/test`                                                                              |
| `simulacao/`               | `@/shared/contracts`, `@/api/transporte`, `@/shared-domain/acesso/permissoes` (arquivo direto), a própria pasta | `@/app`, `@/auth`, `@/pages`, `@/shared/ui`, `@/api` (exceto `transporte`), `import()` dinâmico                          |
| `main.tsx`                 | `@/app/App`, `@/auth/msal.config`, `@/config/environment`, `import('./simulacao')`                              | `@/test`                                                                                                                 |
| `*.test.ts(x)`             | tudo da pasta testada, `@/test/*`, `@/simulacao`                                                                | `@pucpr-ds/react` direto (fora de `shared/ui/`)                                                                          |

</tabela>

<regras>
- Componente do DS, Radix ou ícone: importe de `@/shared/ui`.
- `import()` dinâmico só com caminho literal entre aspas. Proibido `import.meta.glob`.
- A casca não importa a página para saber o que ela quer mostrar no cabeçalho: a página empurra para a casca (`AcoesDoCabecalho`, `useRegistrarTourDaPagina`).
</regras>

Correto:

<exemplo>
```ts
// src/pages/pedidos/components/PedidoDrawer.tsx
import { DialogoDeAcao } from '@/shared-domain/justificativas';
import { BotaoAcao, DetalheDrawer, toast } from '@/shared/ui';
import { usePedido } from '../hooks';
```
</exemplo>

Incorreto:

<exemplo>
```ts
// src/pages/pedidos/components/PedidoDrawer.tsx
import { Button } from '@pucpr-ds/react';
import { TabelaDeTurmas } from '@/pages/turmas/components/TabelaDeTurmas';
import { rotuloDoEstado } from '../../turmas/hooks';
```
</exemplo>

## Abstração

<regras>
- Hook, componente ou função utilitária nova só com dois usos reais ou com regra que precisa de teste unitário isolado.
- Lógica de apresentação de um único componente fica no próprio arquivo do componente, como função local acima dele.
- Regra de cálculo, filtro, ordenação, rótulo ou conversão de formato é função pura exportada de `hooks.ts` (ou de `shared-domain/<assunto>/<assunto>.ts`), com teste unitário.
- Não criar contexto React para passar dado a um filho direto. Passe por prop.
- Não criar estado global. Estado de servidor é do react-query; estado de tela é `useState` no componente da página; estado que precisa sobreviver a recarga ou link vai na URL.
- Implementar a menor mudança que resolve o requisito. Sem refatoração de código não relacionado.
</regras>

## Componentes React

<regras>
- Componente é `export function Nome(props)`. Proibido `export default`. Proibido componente como `const Nome = () =>`.
- Props declaradas numa `interface <Nome>Props` acima do componente e desestruturadas na assinatura, com valor padrão na desestruturação (`tom = 'primario'`).
- Componente auxiliar usado por um só componente é `function` local no mesmo arquivo, sem `export`.
- Renderização condicional: `cond ? <X /> : null`. Proibido `cond && <X />`.
- Promessa não aguardada em handler recebe `void`: `void navigate('/pedidos')`, `void consulta.refetch()`.
- Lista renderizada tem `key` estável vinda do dado (`id`), nunca o índice quando o item tem identidade.
- Valor derivado de props ou de dado da consulta é calculado no render; `useMemo` só para filtrar ou ordenar lista.
- `useEffect` só para sincronizar com fora do React (foco, `matchMedia`, temporizador, evento de janela). Proibido `useEffect` para copiar dado para estado.
- Diálogo e drawer com estado próprio só montam quando abertos: `{aberto ? <XDialog … /> : null}`. O estado do formulário nasce limpo a cada abertura.
- Texto exibido ao usuário é literal em português no JSX ou em constante `Record` (`ROTULO_DA_SITUACAO`). Sem biblioteca de i18n.
</regras>

## Idioma

<regras>
- Português: pastas, arquivos, componentes, hooks, funções, variáveis, props, tipos, constantes, chaves de consulta, ids de tour, nomes de teste (`it('mostra …')`), mensagens e textos de interface.
- Inglês, por convenção de framework: prefixo `use` de hook, prefixo `on` de prop de callback (`onAlterar`, `onFechar`), sufixo `Props`, props herdadas do DOM, do React ou do DS (`children`, `className`, `open`, `onOpenChange`, `title`, `variant`).
- Contrato da API mantém o nome do campo que a API usa (`category`, `code`, `message`, `correlationId` no `ErrorResponse`).
- Arquivo de infraestrutura existente em inglês (`api-client.ts`, `ProtectedRoute.tsx`, `ErrorBoundary.tsx`, `query-client.ts`) mantém o nome. Arquivo novo é em português.
- Nomes expressam a ação ou o conceito de negócio. Proibido: `Manager`, `Helper`, `Util`, `Utils`, `Handler`, `Data`, `Info`, `Item` genérico.
- Texto de interface: frase curta, voz ativa, sem ponto de exclamação. Ação de botão no infinitivo (`Aprovar pedido`, `Tentar de novo`).
</regras>

## Nomenclatura

<tabela>

| Papel                                | Arquivo                                             | Identificador                                                                                       |
| ------------------------------------ | --------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Pasta de página                      | `pages/pedidos/`                                    | kebab-case, substantivo da tela                                                                     |
| Componente raiz da página            | `pages/pedidos/Pedidos.tsx`                         | `Pedidos` (PascalCase da pasta)                                                                     |
| Componente da página                 | `components/TabelaDePedidos.tsx`                    | `TabelaDePedidos`, `FiltrosDePedidos`, `PedidoDrawer`, `NovoPedidoDialog`, `SecaoDeItens`           |
| Tipos locais da página               | `types.ts`                                          | `FiltrosDePedidos`, `NovoPedido`                                                                    |
| Funções HTTP                         | `api.ts`                                            | `listarPedidos`, `obterPedido`, `criarPedido`, `atualizarPedido`, `aprovarPedido`, `cancelarPedido` |
| Consulta                             | `hooks.ts`                                          | `usePedidos()`, `usePedido(id)`                                                                     |
| Escrita                              | `hooks.ts`                                          | `useAprovarPedido(id)`, `useCriarPedido()`                                                          |
| Estado na URL                        | `hooks.ts`                                          | `useEstadoDaLista()`, `useFiltrosDePedidos()`                                                       |
| Registro do tour                     | `hooks.ts`                                          | `usePedidosTour()`                                                                                  |
| Raiz da chave de consulta            | `hooks.ts`                                          | `CHAVE_DOS_PEDIDOS = 'pedidos'`                                                                     |
| Rótulo por valor                     | `hooks.ts` ou `rotulos.ts`                          | `ROTULO_DA_SITUACAO`, `TOM_DA_SITUACAO`                                                             |
| Função pura                          | `hooks.ts`                                          | `filtrarPedidos`, `rotuloDoResultado`, `contagemDePedidos`                                          |
| Tour                                 | `tour.ts`                                           | `tourDaPagina` (id = nome da pasta)                                                                 |
| Barril                               | `index.ts`                                          | —                                                                                                   |
| Contrato                             | `shared/contracts/pedidos.ts`                       | `PedidoDaLista`, `DetalhePedido`, `SituacaoDoPedido`, `AcaoDoPedido`, `CorpoDoCancelamento`         |
| Componente de `shared/ui`            | `shared/ui/FaixaDeAviso.tsx`                        | PascalCase, português                                                                               |
| Ponte do DS                          | `shared/ui/primitives/Seletor.tsx`                  | PascalCase                                                                                          |
| Hook genérico                        | `shared/hooks/useFiltroUrl.ts`                      | `useFiltroUrl`                                                                                      |
| Módulo `.ts` sem componente nem hook | `sessao-do-prototipo.ts`                            | kebab-case                                                                                          |
| Constante de módulo                  | —                                                   | `UPPER_SNAKE_CASE`                                                                                  |
| Teste                                | `Pedidos.test.tsx`, `hooks.test.ts`, `tour.test.ts` | —                                                                                                   |

</tabela>

<regras>
- Verbos de `api.ts`: `listar` (coleção), `obter` (um recurso), `criar`, `atualizar`, `alterar`, `remover`, `aprovar`, `cancelar`, `decidir`, `informar`, `solicitar`, `atribuir`, `desativar`, `reativar`.
- Corpo de request: `Corpo<Do|Da|Dos|Das><Coisa>` (`CorpoDoCancelamento`). Resposta de lista: `<Coisa>DaLista`. Resposta de detalhe: `Detalhe<Coisa>`.
- Prop booleana de estado: adjetivo ou gerúndio (`aberto`, `carregando`, `confirmando`, `ocupado`, `ativo`). Booleano derivado: `pode<Acao>`, `tem<Coisa>` (`podeCriarPedido`, `temFiltrosAtivos`).
- Prop com mensagem de erro: `erro: string | null`.
- Handler local: verbo no infinitivo (`abrirDetalhe`, `limparFiltros`, `confirmarAprovacao`).
- Predicado sobre erro: o estado em português (`naoEncontrado(erro)`, `acessoRevogado(erro)`, `escritaRecusada(erro)`).
- Interface não usa prefixo `I`. Tipo não usa sufixo `Type`.
</regras>

## Comentários

<regras>
- Comentário só para o porquê que o código não mostra: armadilha de biblioteca, critério de acessibilidade, regra de negócio contraintuitiva, código de requisito (`RF046`, `US047/CA003`).
- Nunca descreva o que o código faz. O que precisaria de comentário vira nome melhor ou função menor.
- JSDoc de uma ou duas linhas em export cujo contrato não cabe no nome: formato do valor (`AAAA-MM-DD`), unidade, significado de `null` ou de `''`.
- Escolha feita sem decisão do dono do produto leva o marcador na linha anterior ao código que a aplica: `// DECISAO-PENDENTE: <id-kebab-case>`. Ver [`10-prototipo-e-simulacao.md`](10-prototipo-e-simulacao.md).
- Intenção de teste vai no texto do `it(...)`.
- Proibido: cabeçalho de arquivo, `// TODO`, código comentado, JSDoc que repete a assinatura, comentário sobre o estado de uma ponte do DS.
</regras>

## Tipagem

<regras>
- Tipos de contrato e de `types.ts`: `interface` com todos os campos `readonly`; arrays como `readonly T[]`.
- União de valores é `type` (`type SituacaoDoPedido = 'aberto' | 'aprovado' | 'cancelado'`). Proibido `enum`.
- Mapa de rótulo por valor: `const ROTULO_DA_SITUACAO: Record<SituacaoDoPedido, string>`. Valor novo na união quebra a compilação até o rótulo existir.
- Lista constante tipada: `as const satisfies readonly (keyof X)[]`.
- Estado de tela com variantes: união discriminada por `tipo` (`{ tipo: 'editar'; pedido: DetalhePedido } | { tipo: 'cancelar' }`).
- Campo ausente na resposta é `null` no contrato, nunca `undefined`. Opcional (`?`) só em campo que a API pode omitir.
- `noUncheckedIndexedAccess`: acesso por índice devolve `T | undefined`; trate com `?.` ou `??`. Proibido `!` para silenciar.
- Asserção `as` só na fronteira com dado não tipado (`response.json()`, `location.state`). Proibido `as unknown as`.
- Hook de consulta não declara tipo de retorno: o tipo vem do `useQuery`. Função pura e função de `api.ts` declaram tipo de retorno.
</regras>
