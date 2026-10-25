# Padrões de tela

Componentes citados: [`05-design-system-e-estilo.md`](05-design-system-e-estilo.md). Exemplo completo: [`03-anatomia-da-pagina.md`](03-anatomia-da-pagina.md).

## Estrutura da tela

<estrutura>
```
<Page largura="…">
  <PageHeader title="…" subtitle="…" trilha={…} selo={…} actions={…} />   um h1 por tela
  <FaixaDeAviso …/>                     avisos sobre a tela inteira (opcional)
  <FiltrosBar …/>                        lista com filtros (opcional)
  <Section title="…" acoes={…}>…</Section> | <DataGrid …/>
  <XDrawer …/> | <XDialog …/>            montados no fim, abertos por estado ou pela URL
</Page>
```
</estrutura>

<regras>
- Toda tela retorna `<Page>` na raiz, inclusive nos estados de carregamento, erro e "não encontrado".
- `largura`: `padrao` (formulário, leitura), `ampla` (lista, detalhe com tabela), `total` (tabela larga com muitas colunas).
- Um único `<h1>` por tela, vindo de `PageHeader` ou de `tituloDaPagina` no estado que substitui a tela.
- Subtítulo composto de partes opcionais: `[a, b].filter(Boolean).join(' · ')`.
- Ações da tela vão em `actions` do `PageHeader`; ações de um bloco vão em `acoes` da `Section`.
- Ação que precisa ficar no cabeçalho global da aplicação: `<AcoesDoCabecalho>` dentro da página. Sem `AcoesDoCabecalhoProvider` (teste de página), os filhos aparecem no lugar; com provider e sem `AcoesDoCabecalhoAlvo` montado, nada aparece. Casca nova que monta o provider monta também o alvo.
- Bloco alvo do tutorial é envolvido por `<div id={idDoTour('<pagina>', '<elemento>')}>`. Ver [`11-tutorial-guiado.md`](11-tutorial-guiado.md).
</regras>

## Estados da tela

<regra critica="true">
Toda consulta exibida trata os três estados: carregando, erro e dado. Lista trata também o vazio, com texto diferente quando há filtro ativo.

Estado não tratado mostra tela em branco ou dado `undefined` sem aviso.
</regra>

<tabela>

| Estado     | Tela inteira depende da consulta                                                                                                                                                | Bloco, painel ou drawer                                          | Tabela                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------- |
| Carregando | `<Page><EsqueletoDeTela aria-label="Carregando <coisa>" /></Page>`                                                                                                              | `<StatusMessage variant="loading" title="Carregando <coisa>" />` | `DataGrid carregando`                                     |
| Erro       | `<Page><ErrorState tituloDaPagina titulo="Não foi possível carregar <coisa>" textoTentarNovamente="Tentar de novo" onTentarNovamente={() => void consulta.refetch()} /></Page>` | `<ErrorState mensagem="…" onTentarNovamente={…} />`              | `DataGrid erro onTentarNovamente mensagemErro`            |
| 404        | `<StatusMessage variant="empty" tituloDaPagina title="<Coisa> não encontrada" message="…" action={<InternalLink href="/<lista>" linkText="Ir para <Lista>" type="arrow" />} />` | —                                                                | —                                                         |
| Vazio      | `StatusMessage variant="empty"` / `EmptyState`                                                                                                                                  | `StatusMessage variant="empty" variante="compacta"`              | `tituloVazio`, `mensagemVazio`, `iconeVazio`, `acaoVazio` |

</tabela>

<regras>
- Ordem no componente: `isPending` → `isError` (com `naoEncontrado` antes do erro genérico) → dado. Use retornos antecipados quando o estado substitui a tela inteira.
- Cabeçalho que não depende da consulta (título fixo) é renderizado em todos os estados; só o corpo troca.
- Carregamento de tela é esqueleto, nunca spinner. Spinner (`StatusMessage variant="loading"`) só dentro de bloco, painel ou diálogo.
- Textos: carregando "Carregando <coisa>"; erro "Não foi possível carregar <coisa>"; em `ErrorState`, `textoTentarNovamente="Tentar de novo"`. No `DataGrid`, o botão de erro usa o texto padrão do componente.
- Vazio com filtro ativo: título "Nenhum <coisa> encontrado com esses filtros.", `iconeVazio="filtro-vazio"` e botão "Limpar todos os filtros". Sem filtro: "Nenhum <coisa> encontrado." e, quando ajuda, `mensagemVazio` dizendo o que aparece ali.
- Contagem do resultado: "N <coisas>" ou "N de M <coisas>", em `resultado` do `FiltrosBar`.
</regras>

<exemplo>
```tsx
// src/pages/pedido/Pedido.tsx
export function Pedido() {
  const { id = '' } = useParams();
  const consulta = usePedido(id);

if (consulta.isPending) {
return (
<Page largura="ampla">
<EsqueletoDeTela aria-label="Carregando o pedido" />
</Page>
);
}

if (consulta.isError) {
if (naoEncontrado(consulta.error)) {
return (
<Page largura="ampla">
<StatusMessage
variant="empty"
tituloDaPagina
title="Pedido não encontrado"
message="Confira o endereço ou procure o pedido na lista."
action={<InternalLink href="/pedidos" linkText="Ir para Pedidos" type="arrow" />}
/>
</Page>
);
}
return (
<Page largura="ampla">
<ErrorState
tituloDaPagina
titulo="Não foi possível carregar este pedido"
textoTentarNovamente="Tentar de novo"
onTentarNovamente={() => void consulta.refetch()}
/>
</Page>
);
}

const pedido = consulta.data;

return (
<Page largura="ampla">
<PageHeader
trilha={<Trilha itens={[{ rotulo: 'Pedidos', href: '/pedidos' }, { rotulo: pedido.codigo }]} />}
title={`Pedido ${pedido.codigo}`}
subtitle={pedido.solicitante}
/>
</Page>
);
}

```
</exemplo>

## Lista

<regras>
- Tabela é `DataGrid`. Colunas em constante `COLUNAS: readonly DataGridColumn<T>[]` fora do componente; cada coluna com `chave`, `cabecalho`, `renderizar` e, quando cabe, `ordenavel`, `estreita`, `classe`, `largura`.
- Ordenação e paginação no cliente: `useTabelaNoCliente({ linhas, comparadores, ordenacaoInicial, tamanhoDaPagina: 20 })` de `@/shared/hooks/useTabelaNoCliente`, com `COMPARADORES: ComparadoresDaTabela<T>` fora do componente. Comparação de texto com `localeCompare(b, 'pt-BR')`.
- Linha clicável: `onClicarLinha` abre o detalhe, e `renderizarAcoes` traz o caminho de teclado (`BotaoDeDetalhes` com `rotuloAcessivel="Detalhes de <nome>"`).
- Primeira coluna: nome em `font-poppins text-button font-semibold text-neutral-1050 transition-colors group-hover/linha:text-primary-500` e informação secundária abaixo em `text-caption text-neutral-600`.
- Lista agrupada (um `tbody` por grupo): `grupos={{ obterGrupo }}`, sem paginação.
- Densidade: `arejada` com `alinhamento="topo"` para linha com duas linhas de texto; `confortavel` para linha simples; `compacta` dentro de painel.
</regras>

## Filtros e estado na URL

<regras>
- Busca, filtros, aba, passo de assistente e item aberto no drawer ficam na URL (`useSearchParams`). Estado que não precisa sobreviver a recarga ou link (diálogo aberto) fica em `useState`.
- Um hook em `hooks.ts` concentra o estado da URL da tela (`useEstadoDaLista`, `useFiltrosDe<Coisa>`): lê os parâmetros, valida contra os valores aceitos e expõe `alterar…`, `limpar…`, `abrir`.
- Valor de URL fora dos aceitos vira o padrão (`''`), nunca erro.
- Alterar filtro usa `{ replace: true }`. Abrir item cria entrada no histórico; fechar usa `replace`.
- Filtro de um parâmetro só, sem validação: `useFiltroUrl(chave, padrao)` de `@/shared/hooks/useFiltroUrl`.
- `Seletor` não aceita opção de valor vazio: use a constante `TODAS`/`TODOS` como valor da opção "Todas as …" e converta para `''` ao alterar.
- "Limpar filtros" some ao limpar: devolva o foco ao campo de busca (`ref`). Ver [`08-acessibilidade.md`](08-acessibilidade.md).
- Busca sem acento e sem diferença de maiúsculas: `normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR')`.
</regras>

## Detalhe: rota própria ou drawer

<tabela>

| Use | Quando | Forma |
| --- | --- | --- |
| Página de detalhe em rota (`/pedidos/:id`) | Detalhe com várias seções, ações próprias, link compartilhável como tela | Pasta própria (`pages/pedido/`), `useParams`, trilha de volta para a lista, sub-rota do mesmo destino |
| `DetalheDrawer` com `?pedido=<id>` | Consulta rápida ou decisão a partir da lista, sem sair dela | Componente `<Coisa>Drawer` em `components/` da lista, `id` vindo da URL, `onFechar` limpa o parâmetro |

</tabela>

<regras>
- Drawer recebe `id: string | null` e `onFechar`; `open={id !== null}`. Ele mesmo consulta o detalhe com `use<Coisa>(id)`.
- Conteúdo do drawer com estado próprio leva `key={recurso.id}` para recomeçar ao trocar de item.
- Rodapé do drawer: `ButtonVariante tom="neutro"` "Fechar detalhe".
- Depois de uma escrita no drawer, o detalhe é relido pela invalidação global; o drawer continua aberto.
- Navegação programática: `const navigate = useNavigate()` e `void navigate(rota)`. Caminho com id: `` `/pedidos/${encodeURIComponent(id)}` ``.
</regras>

## Datas, números e textos

<regras>
- Dia exibido: `diaNoFormatoBrasileiro` (`DD/MM/AAAA`). Hora: `horaEmBrasilia`.
- Plural: função pura `contagemDe<Coisa>(n)` em `hooks.ts` ("1 pedido", "3 pedidos"), escolhendo a forma por `n === 1`.
- Mapa de rótulo e de tom por valor de domínio vive em `hooks.ts` (ou `shared-domain/<assunto>/rotulos.ts`) e é usado na tabela, no selo e no filtro.
- Estado não pode ser comunicado só por cor: selo tem texto.
</regras>
```
