# Design system, componentes e estilo

## Import de componentes

<regra critica="true">
Todo componente de interface vem de `@/shared/ui`. Importar `@pucpr-ds/react`, `radix-ui`, `@radix-ui/*` ou `@fortawesome/*` fora de `src/shared/ui/` é erro de lint. Font Awesome só em `src/shared/ui/Icone.tsx`.

Import direto do pacote espalha dependência do DS pela aplicação e pula as pontes que corrigem acessibilidade e lacunas do DS.
</regra>

<regras>
- `src/shared/ui/index.ts` faz `export * from '@pucpr-ds/react'` e depois exporta as composições e as pontes. Exportação nomeada declarada depois do `export *` vence: uma ponte com o mesmo nome do componente do DS o substitui.
- O que o DS instalado exporta de fato está em `node_modules/@pucpr-ds/react/dist/lib/index.d.ts` e nos `.d.ts` de `dist/components/<nome>/`. O Storybook do DS está à frente do pacote publicado; não use como referência do que existe.
- Proibido biblioteca de componentes pronta (MUI, Ant, Chakra e similares). Proibido reescrever componente que o DS tem (`Button`, `Input`, `Checkbox`, `Badge`, `Tabs`, `Tooltip`, `Toast`).
- A raiz da aplicação é envolvida por `<PucProvider>` (`src/app/App.tsx`); teste de componente também. Ver [`12-testes.md`](12-testes.md).
</regras>

## Quando falta componente

<algoritmo>
```
1. Confirmar a ausência no index.d.ts instalado do @pucpr-ds/react.
2. Dá para compor com o que o DS e shared/ui já têm?
     sim → composição em src/shared/ui/<Nome>.tsx
3. Falta o componente inteiro (tabela, diálogo, drawer, card, menu lateral, cabeçalho de aplicação)
   ou falta uma capacidade num componente que existe (tamanho, tom, rótulo acessível, roteamento)?
     → ponte em src/shared/ui/primitives/<Nome>.tsx, sobre Radix ou sobre o componente do DS
     → registrar o pedido ao time do DS
4. O DS publicou o componente ou a capacidade?
     → o PR que sobe a versão do pacote apaga a ponte e troca os usos
```
</algoritmo>

<regras>
- Ponte: comportamento (foco, portal, teclado, `aria`) vem do Radix ou do DS, nunca escrito à mão. Estilo só com token.
- Ponte de capacidade com o mesmo nome do componente do DS (`Search`, `Chips`, `AccordionTrigger`) só soma classe ou prop; é exportada depois do `export *`.
- Ponte com nome próprio (`ButtonVariante`, `BadgeCompacto`, `Seletor`, `InputCompacto`, `DropdownCompacto`) fica ao lado do componente do DS, que continua disponível.
- O estado da ponte (pedido aberto, aguardando versão) não vai em comentário no código.
- Peça que falta numa composição de `app/` (item de menu suspenso) também nasce em `shared/ui/`. Proibido Radix cru em `app/`.
</regras>

## Camada `src/shared/ui/`

<regras>
- Formato achatado: `Componente.tsx` + `Componente.test.tsx` direto em `shared/ui/` ou em `shared/ui/primitives/`. Proibida pasta ou `index.ts` por componente.
- `shared/ui/index.ts` é o único barril. Componente novo entra nele, com o tipo público (`export type { … }`).
- Componente de `shared/ui/` compõe e posiciona: recebe `children` e slots (`acoes`, `selo`, `footer`, `topo`). Sem regra de negócio, sem consulta, sem estado de sessão.
- Props de componente novo em português (`titulo`, `onAlterar`, `tom`, `tamanho`). Props herdadas do DS mantêm o nome do DS.
- Variante visual é prop de união (`tom: 'erro' | 'alerta' | 'sucesso' | 'info'`) mapeada por `Record<Tom, string>` de classes.
</regras>

## Inventário: qual componente usar

<tabela>

| Necessidade                                  | Use                                                                                                             | Não use                                   |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Casca da tela                                | `Page` (`largura`: `padrao`, `ampla`, `total`; `topo`)                                                          | `<main>` próprio                          |
| Título da tela                               | `PageHeader` (`title`, `subtitle`, `trilha`, `eyebrow`, `selo`, `actions`)                                      | `<h1>` solto                              |
| Trilha de navegação                          | `Trilha` (`itens: { rotulo, href? }[]`; sem `href` = página atual)                                              | `Breadcrumb` do DS com `Link` do DS       |
| Bloco com título                             | `Section` (`title`, `card`, `status`, `acoes`)                                                                  | `<section>` com `<h2>` à mão              |
| Botão comum                                  | `Button` (`variant`: `primary`, `secondary`, `tertiary`)                                                        | `<button>` estilizado                     |
| Botão com tom ou pequeno                     | `ButtonVariante` (`tom`: `primario`, `neutro`, `perigo`, `alerta`, `sucesso`, `discreto`; `tamanho`: `pequeno`) | classe por cima do `Button`               |
| Ação sobre recurso com permissão do servidor | `BotaoAcao` (`acao`, `acoes`, `bloqueios`)                                                                      | `Button` com `disabled` calculado na tela |
| Abrir detalhe da linha                       | `BotaoDeDetalhes` (`rotuloAcessivel`)                                                                           | ícone sem nome                            |
| Exportar                                     | `BotaoExportar` (`onExportar(formato)`)                                                                         | diálogo próprio de formato                |
| Link para rota do app                        | `InternalLink` (`href`, `linkText`, `type`)                                                                     | `Link` do DS, `<a href>`                  |
| Link externo, `mailto:`, `tel:`              | `InternalLink type="external"` ou `Link` do DS                                                                  | `InternalLink` sem `type`                 |
| Navegar com cara de botão                    | `Button`/`ButtonVariante` + `onClick={() => void navigate(rota)}`                                               | `asChild` no `Button`                     |
| Seleção única                                | `Seletor` (`rotulo`, `opcoes`, `valor`, `onAlterar`; `compacto` e `rotuloOculto` em barra de filtro)            | `Dropdown` do DS                          |
| Campo de texto                               | `Input` do DS; `InputCompacto` (40px)                                                                           | `<input>` estilizado                      |
| Busca                                        | `Search` (ponte; `rotulo` obrigatório; `compacto`)                                                              | `Input` com ícone                         |
| Escolha em cartões                           | `RadioCartao`                                                                                                   | `RadioGroupField` com `label` complexo    |
| Marcação                                     | `Checkbox` do DS (inclusive indeterminado)                                                                      | caixa própria                             |
| Selo                                         | `BadgeCompacto` (`tom`, `multilinha`)                                                                           | `Badge` do DS com classe                  |
| Tabela                                       | `DataGrid` (colunas, ordenação, paginação, grupos, seleção, vazio, erro)                                        | `Table` direto na página                  |
| Barra de filtros                             | `FiltrosBar` (`busca`, filhos, `resultado`, `temFiltrosAtivos`, `onLimpar`)                                     | `div` flex própria                        |
| Carregando a tela                            | `EsqueletoDeTela` (`aria-label`, `cabecalho`, `corpo`)                                                          | spinner de página                         |
| Carregando um bloco ou painel                | `StatusMessage variant="loading"`                                                                               | `Loading` solto                           |
| Carregando tabela                            | `DataGrid carregando` ou `SkeletonTabela`                                                                       | —                                         |
| Vazio                                        | `DataGrid tituloVazio`; `EmptyState`; `StatusMessage variant="empty"`                                           | texto solto                               |
| Erro de consulta                             | `ErrorState` (`onTentarNovamente` obrigatório); `DataGrid erro`                                                 | `StatusMessage variant="error"` sem ação  |
| Aviso dentro da tela ou do diálogo           | `FaixaDeAviso` (`tom`, `icone`, `acao`, `anuncio`)                                                              | `Alert` próprio                           |
| Nota neutra curta                            | `Nota`                                                                                                          | `<p>` com borda                           |
| Resumo do objeto de uma decisão              | `CaixaDeResumo`                                                                                                 | —                                         |
| Pares rótulo · valor                         | `ListaDeDados`                                                                                                  | `<dl>` à mão                              |
| Indicadores em cartões                       | `CartoesDeResumo`                                                                                               | grade de `Card` própria                   |
| Cartão                                       | `Card` (ponte; `raio`, `sombra`, `respiro`, `clicavel`)                                                         | classe de raio/sombra/padding por cima    |
| Diálogo de formulário                        | `Dialog` (ponte; `title`, `tamanho`, `footer`)                                                                  | modal próprio                             |
| Confirmação                                  | `ConfirmacaoDialog` (`tom`, `tomDoConfirmar`, `confirmando`)                                                    | `window.confirm`                          |
| Ação com justificativa                       | `DialogoDeAcao` de `@/shared-domain/justificativas`                                                             | campo de justificativa próprio            |
| Detalhe lateral                              | `DetalheDrawer` (`titulo`, `subtitulo`, `icone`, `fixo`, `footer`, `largura`)                                   | `Drawer` direto na página                 |
| Abas                                         | `Tabs` do DS; `ListaDeAbasCompacta` para lista que quebra linha                                                 | —                                         |
| Acordeão em cartão                           | `ItemAcordeaoCartao` + `AccordionTrigger`                                                                       | `AccordionItem` com `border`              |
| Passos                                       | `StepsFaixa`                                                                                                    | `Steps` horizontal do DS                  |
| Barra de progresso com tom                   | `ProgressBarTom`                                                                                                | `ProgressBar` com classe                  |
| Ação no cabeçalho global                     | `AcoesDoCabecalho`                                                                                              | portal próprio                            |
| Notificação efêmera                          | `toast.success`, `toast.warning`, `toast.danger`                                                                | `alert()`                                 |
| Dica                                         | `Tooltip` do DS                                                                                                 | `title` HTML                              |
| Ícone                                        | `Icone` (`nome`, `tamanho`, `rotulo`)                                                                           | `FontAwesomeIcon`, svg cru                |

</tabela>

## Ícones

<regras>
- Ícone é `<Icone nome="<nome-semantico>" />`. `nome` é chave do mapa `ICONES` de `src/shared/ui/Icone.tsx`, tipada como `NomeDoIcone`.
- Ícone novo: importar o `fa*` de `@fortawesome/free-solid-svg-icons` em `Icone.tsx` e acrescentar a `ICONES` com nome semântico em português (`pedidos`, `aprovacoes`), nunca o nome do Font Awesome.
- Sem `rotulo`, o ícone é decorativo (`aria-hidden`). Ícone que é o único conteúdo de um controle: o nome acessível vai no controle (`aria-label`), não no ícone. Ícone que carrega informação sozinho: `rotulo`.
- `tamanho`: `pequeno` (16px), `medio` (20px, padrão), `grande` (24px).
- No slot `icon` de `Button`/`ButtonVariante`, passe `<Icone … />`. Proibido svg cru no slot. Ver [`14-problemas-conhecidos.md`](14-problemas-conhecidos.md).
</regras>

## Estilo

<regras>
- Estilo só por utility class do Tailwind com token do DS. Proibido arquivo `.css` por componente, `style={{…}}` com valor visual, CSS-in-JS e `styled-components`.
- Proibido valor visual literal: cor (`#8A0538`, `rgb(…)`), tamanho de fonte, raio ou sombra em px. Sem utility para o token: `var(--token)` (`var(--primary-500)`).
- Valor arbitrário (`[…]`) só para propriedade sem utility (`[overflow-wrap:anywhere]`) ou para seletor (`[&_button]:min-h-10`, `[&>svg]:size-full`).
- Espaçamento e largura com a escala do Tailwind (`gap-3`, `px-4`, `min-w-48`, `max-w-64`).
- Classes condicionais: array filtrado e unido (`[base, condicao && 'classe'].filter(Boolean).join(' ')`). Sem `clsx`.
- Responsividade mobile-first com `sm:`, `md:`, `lg:`, `xl:`. Tabela larga precisa caber em 1024px; informação secundária vai abaixo da principal na mesma célula.
- Hover na linha clicável da tabela: `group-hover/linha:` (o `DataGrid` marca a linha como `group/linha`).
</regras>

<tabela>

| Token     | Classes                                                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Cor       | `{bg,text,border}-{primary,secondary,tertiary}-{100..800}`, `-{success,alert,error,info}-{100..600}`, `-neutral-{50,100..1000,1050}` |
| Título    | `text-heading-{xxl,xl,lg,md,sm,xs}` (Poppins)                                                                                        |
| Subtítulo | `text-subtitle-{lg,md,sm}`                                                                                                           |
| Corpo     | `text-body-lg` (16px), `text-body-sm` (15px). Não existe `text-body-md`.                                                             |
| Apoio     | `text-caption` (13px), `text-nano` (10px), `text-button`                                                                             |
| Família   | `font-poppins` para título e rótulo de destaque; corpo herda Source Sans 3                                                           |
| Raio      | `rounded-{xxsmall,xsmall,small,medium,large,xlarge}`; `rounded-pill` para pílula; `rounded-full` é 50% (círculo)                     |
| Sombra    | `shadow-level-{1,2,3}`; foco `focus-visible:shadow-focus-blue`                                                                       |

</tabela>

<regras>
- Texto principal `text-neutral-1050`; secundário `text-neutral-600`; corpo `text-neutral-800`.
- Classe de token usada pela primeira vez no app: confirme que ela sai no CSS do app (`pnpm build`, procurar a classe fora do bloco do DS em `dist/assets/*.css`). Não saiu: declare o token no `@theme` de `src/styles/theme.css`.
- Em componente do DS, tamanho de texto por token vai como `[&]:text-<token>`. Raio e sombra de `Card` vão pelas props `raio` e `sombra`. Ver [`14-problemas-conhecidos.md`](14-problemas-conhecidos.md).
</regras>

## Folhas de estilo

<regras>
- `src/styles/index.css` é importado uma vez, em `main.tsx`. Ordem obrigatória: `@layer theme, base, ds, components, utilities;` → `tailwindcss/theme.css` (layer theme) e `tailwindcss/utilities.css` (layer utilities), sem preflight → fontes `@fontsource` → `tokens.css` (sem layer) → `theme.css` (`@theme`) → `@pucpr-ds/react/styles` em `layer(ds)` → CSS do Font Awesome em `layer(components)` → `base.css`.
- Proibido tirar o `layer(ds)` ou mudar a ordem das camadas.
- `base.css` não tem seletor de elemento (`h1`, `a`, `button`).
- Fontes só por `@fontsource`. Proibido CDN de fontes.
- `tokens.css` mantém o alias de `--font-family-source` para a família registrada pelo `@fontsource-variable`.
</regras>
