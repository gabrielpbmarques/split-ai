# Testes

## Regras gerais

<regras>
- Vitest com `jsdom` e Testing Library. `globals: false`: importe `describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach` de `vitest`.
- Arquivo `*.test.ts` ou `*.test.tsx` ao lado do arquivo testado. Integração da casca em `src/app/*.integracao.test.tsx`. Critérios de aceite da simulação em `src/simulacao/aceites-*.test.ts`.
- `describe` com o nome do componente ou da função. `it` em português, descrevendo o comportamento visível (`'mostra o erro com "Tentar de novo" quando a consulta falha'`), com o código do requisito quando a asserção vem dele.
- Teste o que pode quebrar: regra, conversão, filtro, estado de tela, permissão, foco. Não teste que o React renderiza ou que o react-query chama a função.
- Cubra o caminho triste e a borda da regra. Teste que passaria com a regra invertida não testa nada.
- Nenhum teste depende da ordem de execução ou de estado deixado por outro teste: reinicie transporte, sessão e simulação em `beforeEach`/`afterEach`.
- Proibido teste de snapshot.
- `any` é permitido em teste; `eslint-disable`, não.
</regras>

## O que testar e com quê

<tabela>

| Alvo                                                  | Arquivo                         | Ferramenta                                                           |
| ----------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------- |
| Função pura de `hooks.ts` (filtro, rótulo, ordenação) | `hooks.test.ts`                 | chamada direta, `it.each` com casos de borda                         |
| Conversão de `api.ts` (`corpoDo<Coisa>`)              | `api.test.ts`                   | chamada direta                                                       |
| Componente de `shared/ui/`                            | `Componente.test.tsx`           | `renderWithProviders`                                                |
| Página ou componente que usa consulta/escrita         | `<Pagina>.test.tsx`             | `renderWithQueryClient` + transporte falso ou simulação              |
| Tour                                                  | `tour.test.ts`                  | chamada direta. Ver [`11-tutorial-guiado.md`](11-tutorial-guiado.md) |
| Fluxo entre telas, permissões, troca de persona       | `src/app/*.integracao.test.tsx` | `renderAplicacao` + simulação + `src/test/integracaoDoPrototipo.ts`  |
| Regra do servidor simulado                            | `src/simulacao/*.test.ts`       | transporte simulado direto                                           |

</tabela>

## Helpers

<regras>
- `renderWithProviders(ui, { route })` (`@/test/render`): `PucProvider` + `MemoryRouter`. Sem `QueryClientProvider`.
- `renderWithQueryClient(ui, { route })` (`@/test/renderWithQueryClient`): o mesmo mais um `QueryClient` novo por chamada, sem retry. Use em tudo que chama `useQuery` ou `useMutation`.
- Proibido criar `QueryClient` dentro de `renderWithProviders`. Ver [`14-problemas-conhecidos.md`](14-problemas-conhecidos.md).
- Componente que usa `useApi` precisa de `<SessaoExpiradaProvider>` em volta.
- `route` define a URL inicial; passe quando o teste depende de parâmetro de rota ou de busca.
- `src/test/` só é importado por teste.
</regras>

## Ambiente e transporte

<regras>
- `vitest.config.ts` fixa em `test.env` toda `VITE_*` que `environment.ts` lê, com as flags desligadas. Variável nova entra ali no mesmo PR.
- Teste que precisa de flag ligada mocka o módulo com getter:
</regras>

<exemplo>
```ts
// src/pages/pedidos/Pedidos.test.tsx
vi.mock('@/config/environment', async (importOriginal) => ({
  ...(await importOriginal<typeof AmbienteModule>()),
  get prototipoAtivo() {
    return true;
  },
}));
```
</exemplo>

<regras>
- Sobrescrever `VITE_*` pela linha de comando não tem efeito no teste. Use o `vi.mock` acima.
- Resposta controlada: `definirTransporte(() => Promise.resolve(new Response(JSON.stringify(corpo), { status, headers: { 'content-type': 'application/json' } })))` de `@/api/transporte`. `restaurarTransportePadrao()` no `afterEach`.
- Dado realista: `instalarSimulacao()`, `reiniciarSimulacaoParaTeste()` (`@/simulacao`), `reiniciarSessaoDoPrototipoParaTeste()` e `entrarComoPersona('<id-da-persona>')` (`@/auth/sessao-do-prototipo`).
- Data simulada fixa: `PUT prototipo/data` com `{ data: 'AAAA-MM-DD' }` pelo transporte, antes de renderizar. Teste de vigência cobre os dias de borda.
- Erro da API no teste tem a forma completa de `ErrorResponse` (`category`, `code`, `message`, `status`, `correlationId`, `timestamp`, `path`).
</regras>

## Consultas e interação

<regras>
- Busque por papel e nome: `getByRole('button', { name: 'Aprovar pedido' })`, `getByRole('heading', { level: 1, name: 'Pedidos' })`. Depois, `getByLabelText` e `getByText`. `getByTestId` só para o `<output>` auxiliar que expõe a URL.
- Elemento que aparece depois da consulta: `await screen.findBy…`. Desaparecimento: `await waitFor(() => expect(…).not.toBeInTheDocument())`.
- Interação com `const user = userEvent.setup()` e `await user.click(…)`, `await user.type(…)`. `fireEvent` só quando `user-event` não alcança o evento.
- Escopo dentro de linha, diálogo ou drawer: `within(elemento)`.
- `Seletor`: clique no `combobox` pelo nome e depois na `option` pelo nome.
- Foco: `expect(elemento).toHaveFocus()`.
- URL: renderize junto um componente que expõe `useLocation()` em `<output data-testid="caminho-da-url">`.
</regras>

<exemplo>
```tsx
// src/pages/pedidos/Pedidos.test.tsx
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { definirTransporte, restaurarTransportePadrao } from '@/api/transporte';
import { SessaoExpiradaProvider } from '@/auth/SessaoExpiradaContext';
import { entrarComoPersona, reiniciarSessaoDoPrototipoParaTeste } from '@/auth/sessao-do-prototipo';
import type * as AmbienteModule from '@/config/environment';
import type { ErrorResponse, PedidoDaLista } from '@/shared/contracts';
import { renderWithQueryClient } from '@/test/renderWithQueryClient';
import { Pedidos } from './Pedidos';

vi.mock('@/config/environment', async (importOriginal) => ({
...(await importOriginal<typeof AmbienteModule>()),
get prototipoAtivo() {
return true;
},
}));

const PEDIDOS: PedidoDaLista[] = [
{
id: 'ped-1',
codigo: 'P-001',
solicitante: 'Ana Souza',
situacao: 'aberto',
criadoEm: '2026-08-01T12:00:00-03:00',
},
{
id: 'ped-2',
codigo: 'P-002',
solicitante: 'Bruno Lima',
situacao: 'cancelado',
criadoEm: '2026-08-02T12:00:00-03:00',
},
];

const FALHA_INTERNA: ErrorResponse = {
category: 'INTERNAL',
code: 'INTERNAL_ERROR',
message: 'Falha inesperada.',
status: 500,
correlationId: 'no-correlation',
timestamp: '2026-01-01T00:00:00.000Z',
path: '/api/pedidos',
};

function responderCom(status: number, corpo: unknown) {
definirTransporte(() =>
Promise.resolve(
new Response(JSON.stringify(corpo), {
status,
headers: { 'content-type': 'application/json' },
}),
),
);
}

function renderizar(rota = '/pedidos') {
return renderWithQueryClient(
<SessaoExpiradaProvider>
<Pedidos />
</SessaoExpiradaProvider>,
{ route: rota },
);
}

describe('Pedidos', () => {
beforeEach(() => {
reiniciarSessaoDoPrototipoParaTeste();
entrarComoPersona('<id-da-persona>');
});

afterEach(() => {
restaurarTransportePadrao();
reiniciarSessaoDoPrototipoParaTeste();
});

it('lista os pedidos com código, solicitante e situação', async () => {
responderCom(200, PEDIDOS);
renderizar();

    const detalhes = await screen.findByRole('button', { name: 'Detalhes de P-001' });
    const linha = detalhes.closest('tr');
    if (!linha) throw new Error('Linha de P-001 não encontrada.');
    expect(within(linha).getByText('Ana Souza')).toBeInTheDocument();
    expect(within(linha).getByText('Aberto')).toBeInTheDocument();
    expect(screen.getByText('2 pedidos')).toBeInTheDocument();

});

it('filtra pela situação da URL e oferece limpar os filtros quando nada sobra', async () => {
const user = userEvent.setup();
responderCom(200, PEDIDOS);
renderizar('/pedidos?situacao=aprovado');

    expect(
      await screen.findByText('Nenhum pedido encontrado com esses filtros.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Limpar todos os filtros' }));
    await screen.findByRole('button', { name: 'Detalhes de P-002' });
    expect(screen.getByRole('combobox', { name: 'Buscar por código ou solicitante' })).toHaveFocus();

});

it('mostra o erro com "Tentar novamente" quando a consulta falha', async () => {
responderCom(500, FALHA_INTERNA);
renderizar();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument();
    });

});
});

```
</exemplo>

<regras>
- Papéis dos componentes de `shared/ui`: `Search` e `Seletor` são `combobox`; o erro do `DataGrid` tem o botão "Tentar novamente"; `ErrorState` usa `textoTentarNovamente`.
- Teste de componente que ramifica numa flag fixa o valor no `vi.mock` com getter, inclusive `false` explícito quando o comportamento depende disso.
</regras>
```
