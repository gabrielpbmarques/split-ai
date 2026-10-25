# Anatomia de uma página

Regras de dados: [`04-dados-do-servidor.md`](04-dados-do-servidor.md). Regras de tela: [`06-padroes-de-tela.md`](06-padroes-de-tela.md). Testes: [`12-testes.md`](12-testes.md).

## Forma da pasta

<estrutura>
```
src/pages/pedidos/
  types.ts             tipos locais da tela (filtros, estado de formulário)
  api.ts               uma função por endpoint que a tela usa
  hooks.ts             consultas, escritas, estado na URL, tour, rótulos, funções puras
  components/          blocos visuais da tela, planos (sem subpasta)
    FiltrosDePedidos.tsx
    PedidoDrawer.tsx
  Pedidos.tsx          componente raiz da tela
  Pedidos.test.tsx
  hooks.test.ts        funções puras de hooks.ts
  tour.ts              tourDaPagina (só se a tela tem tutorial)
  tour.test.ts
  index.ts             única porta de entrada
```
</estrutura>

<regras>
- Só existe o arquivo com conteúdo real. Tela sem consulta não tem `api.ts` nem `hooks.ts`. Tela sem tipo local não tem `types.ts`. `components/` nasce com o primeiro componente.
- Proibido arquivo vazio ou placeholder para "manter o padrão".
- `index.ts` exporta o componente raiz e os tours. Mais nada.
</regras>

<tabela>

| Arquivo            | Faz                                                                                                               | Nunca faz                                                     |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `types.ts`         | Tipos locais: filtros, estado de formulário, uniões da tela                                                       | Tipo de request/response da API (vai em `shared/contracts/`)  |
| `api.ts`           | Uma função por endpoint: caminho, método, corpo; conversão do formato da tela para o do contrato                  | Hook, estado, `try/catch`, `fetch`                            |
| `hooks.ts`         | Consultas, escritas, estado na URL, registro do tour, mapas de rótulo, funções puras de filtro, ordenação e texto | JSX, chamada HTTP fora de `api.ts`                            |
| `components/*.tsx` | Apresentação e interação de um bloco da tela, consumindo hooks de `../hooks`                                      | `useApi`, `useQuery`, `useMutation` diretos; regra de negócio |
| `<Pagina>.tsx`     | Compor os blocos, estado de diálogo aberto, navegação, foco                                                       | Regra de negócio, chamada HTTP                                |
| `tour.ts`          | `tourDaPagina` (e tours extras da mesma tela)                                                                     | Lógica de quando o tour vale (vai em `hooks.ts`)              |
| `index.ts`         | Reexportar o componente raiz e os tours                                                                           | Reexportar componente interno, hook ou tipo                   |

</tabela>

<regras>
- Exceção ao `components/`: a prop `executar` de `DialogoDeAcao` recebe a função de `api.ts` diretamente. Ver [`07-formularios-e-acoes.md`](07-formularios-e-acoes.md).
</regras>

## Exemplo completo: lista com filtro na URL, detalhe em drawer e escritas

### Contrato

<exemplo>
```ts
// src/shared/contracts/pedidos.ts
import type { ComAcoes } from './acoes';

export type SituacaoDoPedido = 'aberto' | 'aprovado' | 'cancelado';

export type AcaoDoPedido = 'aprovar' | 'cancelar';

export interface PedidoDaLista {
readonly id: string;
readonly codigo: string;
readonly solicitante: string;
readonly situacao: SituacaoDoPedido;
readonly criadoEm: string;
}

export interface DetalhePedido extends ComAcoes<AcaoDoPedido> {
readonly id: string;
readonly codigo: string;
readonly solicitante: string;
readonly situacao: SituacaoDoPedido;
readonly observacao: string | null;
readonly criadoEm: string;
}

export interface CorpoDoCancelamento {
readonly justificativa: string;
}

````

```ts
// src/shared/contracts/index.ts
export * from './pedidos';
````

</exemplo>

### `types.ts`

<exemplo>
```ts
// src/pages/pedidos/types.ts
import type { SituacaoDoPedido } from '@/shared/contracts';

export interface FiltrosDePedidos {
readonly busca: string;
readonly situacao: SituacaoDoPedido | '';
}

````
</exemplo>

### `api.ts`

<exemplo>
```ts
// src/pages/pedidos/api.ts
import type { ApiClient } from '@/api/api-client';
import type { CorpoDoCancelamento, DetalhePedido, PedidoDaLista } from '@/shared/contracts';

function caminhoDoPedido(id: string): string {
  return `pedidos/${encodeURIComponent(id)}`;
}

export function listarPedidos(api: ApiClient): Promise<PedidoDaLista[]> {
  return api<PedidoDaLista[]>('pedidos');
}

export function obterPedido(api: ApiClient, id: string): Promise<DetalhePedido> {
  return api<DetalhePedido>(caminhoDoPedido(id));
}

export function aprovarPedido(api: ApiClient, id: string): Promise<DetalhePedido> {
  return api<DetalhePedido>(`${caminhoDoPedido(id)}/aprovar`, { method: 'POST' });
}

export function cancelarPedido(
  api: ApiClient,
  id: string,
  corpo: CorpoDoCancelamento,
): Promise<DetalhePedido> {
  return api<DetalhePedido>(`${caminhoDoPedido(id)}/cancelar`, { method: 'POST', body: corpo });
}
````

</exemplo>

### `hooks.ts`

<exemplo>
```ts
// src/pages/pedidos/hooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useApi } from '@/api/useApi';
import { useChaveDoContexto } from '@/auth/useChaveDoContexto';
import { prototipoAtivo } from '@/config/environment';
import type { PedidoDaLista, SituacaoDoPedido } from '@/shared/contracts';
import { atualizarConsultasDepoisDaEscrita } from '@/shared-domain/administracao';
import { useRegistrarTourDaPagina } from '@/shared-domain/tutorial';
import type { BadgeCompactoTom } from '@/shared/ui';
import { aprovarPedido, listarPedidos, obterPedido } from './api';
import { tourDaPagina } from './tour';
import type { FiltrosDePedidos } from './types';

export const CHAVE_DOS_PEDIDOS = 'pedidos';

export const ROTULO_DA_SITUACAO: Record<SituacaoDoPedido, string> = {
aberto: 'Aberto',
aprovado: 'Aprovado',
cancelado: 'Cancelado',
};

export const TOM_DA_SITUACAO: Record<SituacaoDoPedido, BadgeCompactoTom> = {
aberto: 'alerta',
aprovado: 'sucesso',
cancelado: 'neutro',
};

export const SITUACOES = Object.keys(ROTULO_DA_SITUACAO) as SituacaoDoPedido[];

const CHAVES_DE_FILTRO = [
'busca',
'situacao',
] as const satisfies readonly (keyof FiltrosDePedidos)[];

export function usePedidosTour(pedidoAberto: string | null): void {
useRegistrarTourDaPagina(pedidoAberto === null ? tourDaPagina.tour : undefined);
}

export function usePedidos() {
const api = useApi();
const chave = useChaveDoContexto();

return useQuery({
queryKey: [CHAVE_DOS_PEDIDOS, 'lista', ...chave],
queryFn: () => listarPedidos(api),
enabled: !prototipoAtivo || chave[0] !== null,
});
}

export function usePedido(id: string | null) {
const api = useApi();
const chave = useChaveDoContexto();

return useQuery({
queryKey: [CHAVE_DOS_PEDIDOS, 'detalhe', id, ...chave],
queryFn: () => obterPedido(api, id ?? ''),
enabled: id !== null && (!prototipoAtivo || chave[0] !== null),
});
}

export function useAprovarPedido(id: string) {
const api = useApi();
const queryClient = useQueryClient();

return useMutation({
mutationFn: () => aprovarPedido(api, id),
onSuccess: () => atualizarConsultasDepoisDaEscrita(queryClient),
});
}

function situacaoDaUrl(valor: string | null): SituacaoDoPedido | '' {
return SITUACOES.find((situacao) => situacao === valor) ?? '';
}

export function useEstadoDaLista() {
const [params, setParams] = useSearchParams();
const filtros: FiltrosDePedidos = {
busca: params.get('busca') ?? '',
situacao: situacaoDaUrl(params.get('situacao')),
};

function alterar(chave: string, valor: string, substituir = true) {
setParams(
(atual) => {
const proximo = new URLSearchParams(atual);
if (valor) proximo.set(chave, valor);
else proximo.delete(chave);
return proximo;
},
{ replace: substituir },
);
}

function limparFiltros() {
setParams(
(atual) => {
const proximo = new URLSearchParams(atual);
for (const chave of CHAVES_DE_FILTRO) proximo.delete(chave);
return proximo;
},
{ replace: true },
);
}

return {
filtros,
filtrosAtivos: CHAVES_DE_FILTRO.some((chave) => filtros[chave] !== ''),
aberto: params.get('pedido') || null,
alterarFiltro: (chave: keyof FiltrosDePedidos, valor: string) => alterar(chave, valor),
limparFiltros,
abrir: (id: string | null) => alterar('pedido', id ?? '', id === null),
};
}

function normalizar(texto: string): string {
return texto
.normalize('NFD')
.replace(/\p{Diacritic}/gu, '')
.toLocaleLowerCase('pt-BR');
}

export function filtrarPedidos(
pedidos: readonly PedidoDaLista[],
{ busca, situacao }: FiltrosDePedidos,
): PedidoDaLista[] {
const termo = normalizar(busca.trim());
return pedidos.filter(
(pedido) =>
(termo === '' ||
normalizar(pedido.codigo).includes(termo) ||
normalizar(pedido.solicitante).includes(termo)) &&
(situacao === '' || pedido.situacao === situacao),
);
}

export function rotuloDoResultado(visiveis: number, total: number): string {
const pedidos = total === 1 ? 'pedido' : 'pedidos';
return visiveis === total ? `${total} ${pedidos}` : `${visiveis} de ${total} ${pedidos}`;
}

````
</exemplo>

### `components/FiltrosDePedidos.tsx`

<exemplo>
```tsx
// src/pages/pedidos/components/FiltrosDePedidos.tsx
import type { Ref } from 'react';
import { FiltrosBar, Search, Seletor } from '@/shared/ui';
import { ROTULO_DA_SITUACAO, SITUACOES } from '../hooks';
import type { FiltrosDePedidos as Filtros } from '../types';

const TODAS = 'todas';

const OPCOES_DE_SITUACAO = [
  { valor: TODAS, rotulo: 'Todas as situações' },
  ...SITUACOES.map((situacao) => ({ valor: situacao, rotulo: ROTULO_DA_SITUACAO[situacao] })),
];

interface FiltrosDePedidosProps {
  filtros: Filtros;
  ativo: boolean;
  resultado?: string;
  refDaBusca?: Ref<HTMLInputElement>;
  onAlterar: (chave: keyof Filtros, valor: string) => void;
  onLimpar: () => void;
}

export function FiltrosDePedidos({
  filtros,
  ativo,
  resultado,
  refDaBusca,
  onAlterar,
  onLimpar,
}: FiltrosDePedidosProps) {
  return (
    <FiltrosBar
      linhaUnicaDesde="lg"
      onLimpar={onLimpar}
      temFiltrosAtivos={ativo}
      resultado={resultado}
      busca={
        <Search
          ref={refDaBusca}
          compacto
          rotulo="Buscar por código ou solicitante"
          placeholder="Buscar por código ou solicitante..."
          value={filtros.busca}
          onChange={(valor) => onAlterar('busca', valor)}
        />
      }
    >
      <Seletor
        rotulo="Situação"
        rotuloOculto
        compacto
        className="min-w-0 flex-1 basis-40 sm:w-52 sm:flex-none"
        opcoes={OPCOES_DE_SITUACAO}
        valor={filtros.situacao || TODAS}
        onAlterar={(valor) => onAlterar('situacao', valor === TODAS ? '' : valor)}
      />
    </FiltrosBar>
  );
}
````

</exemplo>

### `components/PedidoDrawer.tsx`

<exemplo>
```tsx
// src/pages/pedidos/components/PedidoDrawer.tsx
import { useState } from 'react';
import type { DetalhePedido } from '@/shared/contracts';
import { diaNoFormatoBrasileiro, mensagemDaEscrita } from '@/shared-domain/administracao';
import { DialogoDeAcao } from '@/shared-domain/justificativas';
import {
  BadgeCompacto,
  BotaoAcao,
  ButtonVariante,
  ConfirmacaoDialog,
  DetalheDrawer,
  ErrorState,
  FaixaDeAviso,
  StatusMessage,
  toast,
} from '@/shared/ui';
import { cancelarPedido } from '../api';
import { ROTULO_DA_SITUACAO, TOM_DA_SITUACAO, useAprovarPedido, usePedido } from '../hooks';

type Dialogo = 'aprovar' | 'cancelar';

function AcoesDoPedido({ pedido }: { pedido: DetalhePedido }) {
const aprovacao = useAprovarPedido(pedido.id);
const [dialogo, setDialogo] = useState<Dialogo | null>(null);
const erroDaAprovacao = aprovacao.isError
? mensagemDaEscrita(aprovacao.error, 'Não foi possível aprovar o pedido.')
: null;

function abrir(novo: Dialogo) {
aprovacao.reset();
setDialogo(novo);
}

function fechar() {
setDialogo(null);
}

return (
<>
<div className="flex flex-wrap gap-2">
<BotaoAcao
acao="aprovar"
acoes={pedido.acoes}
bloqueios={pedido.bloqueios}
tom="sucesso"
tamanho="pequeno"
onClick={() => abrir('aprovar')} >
Aprovar pedido
</BotaoAcao>
<BotaoAcao
acao="cancelar"
acoes={pedido.acoes}
bloqueios={pedido.bloqueios}
tom="perigo"
tamanho="pequeno"
onClick={() => abrir('cancelar')} >
Cancelar pedido
</BotaoAcao>
</div>

      <ConfirmacaoDialog
        open={dialogo === 'aprovar'}
        onOpenChange={(aberto) => {
          if (!aberto && !aprovacao.isPending) fechar();
        }}
        titulo={`Aprovar o pedido ${pedido.codigo}?`}
        tamanho="compacto"
        textoConfirmar="Aprovar pedido"
        confirmando={aprovacao.isPending}
        onConfirmar={() =>
          aprovacao.mutate(undefined, {
            onSuccess: () => {
              toast.success('Pedido aprovado.');
              fechar();
            },
          })
        }
      >
        <div className="flex flex-col gap-3">
          {erroDaAprovacao ? (
            <FaixaDeAviso tom="erro" icone="erro" anuncio="alert">
              {erroDaAprovacao}
            </FaixaDeAviso>
          ) : null}
          <p>O solicitante é avisado e o pedido sai da fila de abertos.</p>
        </div>
      </ConfirmacaoDialog>

      {dialogo === 'cancelar' ? (
        <DialogoDeAcao
          acao="Cancelar pedido"
          resumo={
            <>
              Você cancela <strong>{pedido.codigo}</strong>. O pedido fica no histórico.
            </>
          }
          textoConfirmar="Cancelar pedido"
          executar={(api, justificativa) => cancelarPedido(api, pedido.id, { justificativa })}
          mensagemDeSucesso="Pedido cancelado."
          onConcluir={fechar}
          onCancelar={fechar}
        />
      ) : null}
    </>

);
}

interface PedidoDrawerProps {
id: string | null;
onFechar: () => void;
}

export function PedidoDrawer({ id, onFechar }: PedidoDrawerProps) {
const consulta = usePedido(id);
const pedido = consulta.data;

return (
<DetalheDrawer
open={id !== null}
onOpenChange={(aberto) => {
if (!aberto) onFechar();
}}
icone="pedidos"
titulo={pedido ? `Pedido ${pedido.codigo}` : 'Pedido'}
subtitulo={pedido?.solicitante}
footer={
<ButtonVariante type="button" tom="neutro" onClick={onFechar}>
Fechar detalhe
</ButtonVariante>
} >
{consulta.isPending && id !== null ? (
<StatusMessage variant="loading" title="Carregando pedido" />
) : null}
{consulta.isError ? (
<ErrorState
mensagem="Não foi possível carregar este pedido."
onTentarNovamente={() => void consulta.refetch()}
/>
) : null}
{pedido ? (
<div key={pedido.id} className="flex flex-col gap-4">
<div className="flex flex-wrap items-center gap-2">
<BadgeCompacto tom={TOM_DA_SITUACAO[pedido.situacao]}>
{ROTULO_DA_SITUACAO[pedido.situacao]}
</BadgeCompacto>
<span className="text-caption text-neutral-600">
Criado em {diaNoFormatoBrasileiro(pedido.criadoEm)}
</span>
</div>
<AcoesDoPedido pedido={pedido} />
<p className="text-body-sm text-neutral-800">{pedido.observacao ?? 'Sem observação.'}</p>
</div>
) : null}
</DetalheDrawer>
);
}

````
</exemplo>

### `Pedidos.tsx`

<exemplo>
```tsx
// src/pages/pedidos/Pedidos.tsx
import { useMemo, useRef } from 'react';
import type { PedidoDaLista } from '@/shared/contracts';
import { useTabelaNoCliente } from '@/shared/hooks/useTabelaNoCliente';
import type { ComparadoresDaTabela } from '@/shared/hooks/useTabelaNoCliente';
import { diaNoFormatoBrasileiro } from '@/shared-domain/administracao';
import { idDoTour } from '@/shared-domain/tutorial';
import { BadgeCompacto, BotaoDeDetalhes, Button, DataGrid, Page, PageHeader } from '@/shared/ui';
import type { DataGridColumn } from '@/shared/ui';
import { FiltrosDePedidos } from './components/FiltrosDePedidos';
import { PedidoDrawer } from './components/PedidoDrawer';
import {
  ROTULO_DA_SITUACAO,
  TOM_DA_SITUACAO,
  filtrarPedidos,
  rotuloDoResultado,
  useEstadoDaLista,
  usePedidos,
  usePedidosTour,
} from './hooks';

const COMPARADORES: ComparadoresDaTabela<PedidoDaLista> = {
  codigo: (a, b) => a.codigo.localeCompare(b.codigo, 'pt-BR'),
  criadoEm: (a, b) => a.criadoEm.localeCompare(b.criadoEm),
};

const COLUNAS: readonly DataGridColumn<PedidoDaLista>[] = [
  {
    chave: 'codigo',
    cabecalho: 'Pedido',
    ordenavel: true,
    classe: 'min-w-48',
    renderizar: (pedido) => (
      <div className="flex flex-col gap-1">
        <span className="font-poppins text-button font-semibold text-neutral-1050 transition-colors group-hover/linha:text-primary-500">
          {pedido.codigo}
        </span>
        <span className="text-caption text-neutral-600">{pedido.solicitante}</span>
      </div>
    ),
  },
  {
    chave: 'criadoEm',
    cabecalho: 'Criado em',
    ordenavel: true,
    estreita: true,
    renderizar: (pedido) => diaNoFormatoBrasileiro(pedido.criadoEm),
  },
  {
    chave: 'situacao',
    cabecalho: 'Situação',
    estreita: true,
    renderizar: (pedido) => (
      <BadgeCompacto tom={TOM_DA_SITUACAO[pedido.situacao]}>
        {ROTULO_DA_SITUACAO[pedido.situacao]}
      </BadgeCompacto>
    ),
  },
];

export function Pedidos() {
  const consulta = usePedidos();
  const { filtros, filtrosAtivos, aberto, alterarFiltro, limparFiltros, abrir } =
    useEstadoDaLista();
  const campoDeBusca = useRef<HTMLInputElement>(null);
  usePedidosTour(aberto);

  const todos = consulta.data;
  const { busca, situacao } = filtros;
  const visiveis = useMemo(
    () => filtrarPedidos(todos ?? [], { busca, situacao }),
    [todos, busca, situacao],
  );
  const tabela = useTabelaNoCliente({
    linhas: visiveis,
    comparadores: COMPARADORES,
    ordenacaoInicial: { chave: 'criadoEm', direcao: 'desc' },
    tamanhoDaPagina: 20,
  });

  function limparEFocarBusca() {
    limparFiltros();
    campoDeBusca.current?.focus();
  }

  return (
    <Page largura="ampla">
      <div id={idDoTour('pedidos', 'cabecalho')}>
        <PageHeader title="Pedidos" subtitle="Pedidos abertos, aprovados e cancelados." />
      </div>
      <div id={idDoTour('pedidos', 'filtros')}>
        <FiltrosDePedidos
          filtros={filtros}
          ativo={filtrosAtivos}
          resultado={todos ? rotuloDoResultado(visiveis.length, todos.length) : undefined}
          refDaBusca={campoDeBusca}
          onAlterar={alterarFiltro}
          onLimpar={limparEFocarBusca}
        />
      </div>
      <div id={idDoTour('pedidos', 'tabela')}>
        <DataGrid
          colunas={COLUNAS}
          linhas={tabela.linhasVisiveis}
          obterId={(pedido) => pedido.id}
          carregando={consulta.isPending}
          erro={consulta.isError}
          onTentarNovamente={() => void consulta.refetch()}
          mensagemErro="Não foi possível carregar os pedidos."
          ordenacao={tabela.ordenacao}
          onOrdenar={tabela.onOrdenar}
          paginacao={tabela.paginacao}
          densidade="arejada"
          alinhamento="topo"
          onClicarLinha={(pedido) => abrir(pedido.id)}
          renderizarAcoes={(pedido) => (
            <BotaoDeDetalhes
              rotuloAcessivel={`Detalhes de ${pedido.codigo}`}
              onClick={() => abrir(pedido.id)}
            />
          )}
          tituloVazio={
            filtrosAtivos
              ? 'Nenhum pedido encontrado com esses filtros.'
              : 'Nenhum pedido encontrado.'
          }
          iconeVazio={filtrosAtivos ? 'filtro-vazio' : undefined}
          acaoVazio={
            filtrosAtivos ? (
              <Button type="button" variant="tertiary" onClick={limparEFocarBusca}>
                Limpar todos os filtros
              </Button>
            ) : undefined
          }
        />
      </div>
      <PedidoDrawer id={aberto} onFechar={() => abrir(null)} />
    </Page>
  );
}
````

</exemplo>

### `tour.ts` e `index.ts`

<exemplo>
```ts
// src/pages/pedidos/tour.ts
import { idDoTour } from '@/shared-domain/tutorial';
import type { Tour } from '@/shared-domain/tutorial';

export const tourDaPagina: Tour = {
tour: 'pedidos',
steps: [
{
title: 'Os pedidos do seu escopo',
content: 'Aqui ficam os pedidos abertos, aprovados e cancelados que você acompanha.',
selector: `#${idDoTour('pedidos', 'cabecalho')}`,
side: 'bottom',
requisitos: ['RF010'],
},
{
title: 'Ache um pedido',
content: 'Busque pelo código ou pelo solicitante, ou filtre pela situação.',
selector: `#${idDoTour('pedidos', 'filtros')}`,
side: 'bottom',
requisitos: ['US020'],
},
{
title: 'Abra o pedido para decidir',
content: 'Clique na linha para ver o pedido e aprovar ou cancelar.',
selector: `#${idDoTour('pedidos', 'tabela')} thead`,
side: 'bottom',
requisitos: ['US021'],
},
],
};

````

```ts
// src/pages/pedidos/index.ts
export { Pedidos } from './Pedidos';
export { tourDaPagina } from './tour';
````

</exemplo>

### Registro da tela

<exemplo>
```ts
// src/shared-domain/acesso/permissoes.ts
export const PERMISSOES = {
  verPedidos: 'PEDIDOS.PEDIDO.VER',
  aprovarPedidos: 'PEDIDOS.PEDIDO.APROVAR',
  exportarPedidos: 'PEDIDOS.PEDIDO.EXPORTAR',
} as const;
```

```ts
// src/shared-domain/acesso/destinos.ts
export const DESTINOS: readonly Destino[] = [
  {
    id: 'pedidos',
    rotulo: 'Pedidos',
    descricao: 'Pedidos abertos, aprovados e cancelados.',
    rota: '/pedidos',
    permissao: PERMISSOES.verPedidos,
    icone: 'pedidos',
    etapa: 5,
    modo: 'prototipo',
    noMenu: true,
    noInicio: true,
  },
];
```

```tsx
// src/app/routes.tsx
import { Pedidos, tourDaPagina as tourDosPedidos } from '@/pages/pedidos';

export const TOURS_DAS_PAGINAS: Tour[] = [tourDosPedidos];

const TELAS_JA_DISPONIVEIS: Readonly<Record<string, readonly TelaDoDestino[]>> =
  {
    pedidos: [{ caminho: destinoPorId('pedidos').rota, elemento: <Pedidos /> }],
  };
```

```ts
// src/shared/ui/Icone.tsx
const ICONES = {
  pedidos: faClipboardList,
} satisfies Record<string, IconDefinition>;
```

</exemplo>

<regras>
- Os quatro blocos acima mostram só a entrada nova. Acrescente-a à estrutura existente do arquivo, sem remover as demais.
- A tela nunca é registrada como `<Route>` solta: toda rota autenticada nasce de um destino em `DESTINOS` e passa por `RotaComPermissao`. Ver [`09-autenticacao-e-permissoes.md`](09-autenticacao-e-permissoes.md).
- Sub-rota da mesma guarda (detalhe em rota própria, conclusão) entra no array do mesmo destino: `` { caminho: `${destinoPorId('pedidos').rota}/:id`, elemento: <Pedido /> } ``.
</regras>

## Receita: criar uma página

<checklist>
1. Se a tela consome endpoint novo: criar ou estender `src/shared/contracts/<assunto>.ts` e exportar em `src/shared/contracts/index.ts`.
2. Gerar o esqueleto: `pnpm criar:pagina <nome> --titulo "<Título>" --recurso <caminho/na/api>` (ou `--sem-dados`). O script não sobrescreve arquivo existente.
3. Trocar o tipo provisório de `types.ts` pelo contrato de `@/shared/contracts`; manter em `types.ts` só tipo local. Sem tipo local, apagar `types.ts`.
4. Escrever `api.ts`: uma função por endpoint.
5. Escrever `hooks.ts`: consultas, escritas, estado na URL, rótulos, funções puras, registro do tour.
6. Escrever `components/` e o componente raiz.
7. Se a tela tem tutorial: `tour.ts` e `tour.test.ts`. Ver [`11-tutorial-guiado.md`](11-tutorial-guiado.md).
8. Exportar em `index.ts` o componente raiz e os tours.
9. Registrar: permissão em `PERMISSOES`, destino em `DESTINOS`, tela em `TELAS_JA_DISPONIVEIS`, tour em `TOURS_DAS_PAGINAS`, ícone em `ICONES` se novo.
10. No protótipo: rota simulada em `src/simulacao/rotas/` e seed. Ver [`10-prototipo-e-simulacao.md`](10-prototipo-e-simulacao.md).
11. Testes: `<Pagina>.test.tsx`, `hooks.test.ts` para funções puras, `tour.test.ts`. Ver [`12-testes.md`](12-testes.md).
12. Rodar a verificação de [`01-topologia.md`](01-topologia.md).
</checklist>
