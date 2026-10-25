# Dados do servidor

Exemplo completo: [`03-anatomia-da-pagina.md`](03-anatomia-da-pagina.md).

## Fluxo de uma requisição

<fluxo>
```
Componente
  → hook de hooks.ts (useQuery / useMutation)
      → função de api.ts (api, ...parâmetros)
          → ApiClient de useApi()
              → token (useAccessToken) + cabeçalhos (authorization, x-correlation-id, x-contexto-id)
              → transporte atual (fetch, ou servidor simulado no protótipo)
          ← JSON tipado | 204 → undefined
          ← resposta não-ok → ApiError(status, ErrorResponse) | falha de rede → NetworkError
  → 401: diálogo de sessão expirada (api-client)
  → 403: QueryCache/MutationCache globais (app/query-client.ts)
  → demais erros: a tela trata (ErrorState, FaixaDeAviso, erro por campo)
```
</fluxo>

## Cliente HTTP

<regras>
- Toda requisição passa por `const api = useApi()` e por uma função de `api.ts`. Proibido `fetch`, `axios` ou `XMLHttpRequest` fora de `src/api/transporte.ts`.
- Proibido chamar `createApiClient` fora de `useApi`. Proibido montar `authorization` à mão.
- `api<T>(caminho, { method, body, signal })`: caminho relativo a `${VITE_API_URL}/api/`, sem barra inicial (`'pedidos'`, `` `pedidos/${id}` ``). `method` padrão `GET`. `body` é objeto; o cliente serializa e põe `content-type`.
- O cliente lança `ApiError` (`status`, `body: ErrorResponse | undefined`) para resposta não-ok e `NetworkError` para falha de rede. Requisição abortada propaga o erro original.
- 401 chama o aviso de sessão expirada antes de lançar. A tela não trata 401.
- Cabeçalho novo: constante em `src/shared/contracts/headers.ts` e inclusão em `src/api/api-client.ts`.
</regras>

## Contratos

<regras>
- Tipo de request e response da API mora em `src/shared/contracts/<assunto>.ts` e é reexportado por `src/shared/contracts/index.ts` (`export * from './<assunto>'`).
- Contrato espelha a API: mesmos nomes de campo, datas e instantes como `string` ISO, ids como `string`, ausência como `null`.
- Recurso com ações calculadas pelo servidor estende `ComAcoes<AcaoDoRecurso>` (`acoes`, `bloqueios`). Ver [`07-formularios-e-acoes.md`](07-formularios-e-acoes.md).
- Campo ou rota que a API ainda não tem: JSDoc `Extensão.` no campo e marcador `// DECISAO-PENDENTE: <id>` antes do tipo.
- Sem validação de resposta em runtime: o genérico de `api<T>()` tipa a resposta.
- Datas de vigência: use `instanteDoInicioDoDia`, `instanteDepoisDoDia`, `diaEmBrasilia`, `ultimoDiaAntesDe`, `diasEntre`, `somarDias`, `horaEmBrasilia` de `@/shared/contracts`. Proibido converter dia com `new Date(...)` ou somando dia no fuso do navegador. Ver [`14-problemas-conhecidos.md`](14-problemas-conhecidos.md).
- Exibir data: `diaNoFormatoBrasileiro(valor)` de `@/shared-domain/administracao`.
</regras>

## `api.ts`

<regras>
- Uma função exportada por endpoint: `(api: ApiClient, ...parametros, corpo?) => Promise<T>`, com tipo de retorno declarado.
- Todo segmento dinâmico do caminho passa por `encodeURIComponent`.
- Caminho repetido vira função local `caminhoDo<Recurso>(id)`.
- Querystring com `URLSearchParams`; parâmetro vazio não vai. Filtros opcionais: função local `consultaDosFiltros(filtros)` que devolve `''` ou `?…`.
- Conversão do formato da tela para o do contrato (dia do formulário → instante, campo vazio → ausente) é função pura exportada de `api.ts` (`corpoDo<Coisa>`), com teste em `api.test.ts`.
- Campo opcional ausente no corpo: espalhe condicionalmente (`...(valor === '' ? {} : { campo: valor })`). Limpar campo no PATCH: envie `null`.
- Sem `try/catch`, sem estado, sem hook.
</regras>

<exemplo>
```ts
// src/pages/pedidos/api.ts
function consultaDosFiltros(filtros: FiltrosNoServidor): string {
  const consulta = new URLSearchParams();
  for (const [chave, valor] of Object.entries(filtros)) if (valor) consulta.set(chave, valor);
  const texto = consulta.toString();
  return texto === '' ? '' : `?${texto}`;
}

export function listarPedidosFiltrados(
api: ApiClient,
filtros: FiltrosNoServidor,
): Promise<PedidoDaLista[]> {
return api<PedidoDaLista[]>(`pedidos${consultaDosFiltros(filtros)}`);
}

````
</exemplo>

## Consultas

<regra critica="true">
Toda consulta termina a chave com `...useChaveDoContexto()` e declara `enabled: !prototipoAtivo || chave[0] !== null`.

Sem a chave do contexto, a troca de persona ou de contexto mostra o dado do contexto anterior. Sem o `enabled`, a consulta dispara antes de haver sessão no protótipo e recebe 403, que leva a tela para `/sem-permissao`.
</regra>

<regras>
- Consulta é hook `use<Coisa>(parametros)` em `hooks.ts`. Consulta usada por 2+ páginas mora em `shared-domain/<assunto>/hooks.ts`.
- `queryKey`: `[RAIZ, subchave, ...parametros, ...chave]`. `RAIZ` é a constante exportada da página (`CHAVE_DOS_PEDIDOS = 'pedidos'`). Subchave descreve a consulta (`'lista'`, `'detalhe'`, `'catalogo'`).
- Todo parâmetro que muda a resposta entra na chave, normalizado (`busca.trim()`).
- Consulta que depende de parâmetro: `enabled: id !== null && (!prototipoAtivo || chave[0] !== null)`, `queryFn: () => obterPedido(api, id ?? '')`.
- Consulta sob demanda (só ao abrir um painel): parâmetro `ativo: boolean` e `enabled: ativo && (…)`.
- Busca digitada enviada ao servidor: `placeholderData: keepPreviousData`.
- Detalhe aberto por id na URL de rota: `retry: repetirConsultaDaAdministracao` (não repete 404 nem acesso revogado).
- Padrões globais (`app/query-client.ts`): `staleTime: 30_000`, uma nova tentativa, `refetchOnWindowFocus: false`. Não sobrescreva em consulta individual sem motivo concreto.
- Filtro que a API aceita vai na chave e no request. Filtro que a API não aceita é função pura no cliente sobre a coleção (`filtrarPedidos`).
- O componente lê `data`, `isPending`, `isError`, `error` e `refetch` da consulta. Proibido copiar `data` para `useState`.
- `isPending` com `enabled: false` é `true`: guarde o estado de carregamento com a condição do `enabled` (`consulta.isPending && id !== null`).
</regras>

## Escritas

<regras>
- Escrita é hook `use<Verbo><Coisa>(ids)` em `hooks.ts` com `useMutation`. `mutationFn` chama a função de `api.ts`.
- `onSuccess` do `useMutation` devolve `atualizarConsultasDepoisDaEscrita(queryClient)`. A mutação só termina depois de o `/me` e as consultas serem relidos.
- Resposta da escrita é o recurso completo que a tela mostra: `queryClient.setQueryData(chave, resposta)` antes de `atualizarConsultasDepoisDaEscrita`.
- Página cujo destino tem `modo: 'real'` ou `'ambos'`: depois de `atualizarConsultasDepoisDaEscrita`, invalide também `[RAIZ]` da página. Com a API real, `atualizarConsultasDepoisDaEscrita` relê só o `/me` e as consultas `['admin', …]`; no protótipo, relê todas.
- Lista que pode ter ficado velha (outra pessoa alterou): `onError` relê a lista quando `escritaRecusada(erro)` (400, 404, 409).
- Efeito de tela (toast, fechar diálogo, mover foco) vai no segundo argumento de `mutate(variaveis, { onSuccess })`, no componente. Regra de cache fica no `useMutation`.
- Ao abrir o diálogo da ação, chame `mutation.reset()` para não exibir o erro da tentativa anterior.
- Mesma mutação disparada em paralelo em linhas diferentes, cada uma com seu aviso: `await mutateAsync(v)` em `try/catch/finally`, com um `Set` de ids em andamento no estado.
- Sem atualização otimista: a tela reflete a escrita depois da resposta.
- Escrita que exige justificativa: `DialogoDeAcao`. Ver [`07-formularios-e-acoes.md`](07-formularios-e-acoes.md).
</regras>

<exemplo>
```ts
// src/pages/pedidos/hooks.ts
export function useInformarPrazo(id: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  const chave = useChaveDoContexto();

  return useMutation({
    mutationFn: (prazo: string) => informarPrazo(api, id, { prazo }),
    onSuccess: async (pedido) => {
      queryClient.setQueryData([CHAVE_DOS_PEDIDOS, 'detalhe', id, ...chave], pedido);
      await atualizarConsultasDepoisDaEscrita(queryClient);
      await queryClient.invalidateQueries({ queryKey: [CHAVE_DOS_PEDIDOS] });
    },
    onError: (erro) => {
      if (escritaRecusada(erro)) void queryClient.invalidateQueries({ queryKey: [CHAVE_DOS_PEDIDOS] });
    },
  });
}
````

</exemplo>

## Erros de API

<tabela>

| Situação                                              | Quem trata             | Como                                                                                                           |
| ----------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| 401                                                   | `api-client`           | Abre o diálogo de sessão expirada. A tela não faz nada.                                                        |
| 403 em consulta                                       | `QueryCache` global    | Leva a `/sem-permissao`. A tela não faz nada.                                                                  |
| 403 em escrita                                        | `MutationCache` global | Toast "Você não tem permissão para executar esta ação." `mensagemDaEscrita` devolve `null`; a tela não repete. |
| 403 `ACESSO_REVOGADO`                                 | casca                  | Invalida o `/me`; a casca vira "Seu acesso foi revogado".                                                      |
| 503 `PROVEDOR_INDISPONIVEL` e `NetworkError` no `/me` | casca (`AppLayout`)    | `ProvedorIndisponivel` / `SemConexao`.                                                                         |
| 404 no recurso da tela                                | tela                   | `naoEncontrado(consulta.error)` → `StatusMessage variant="empty"` com link de volta.                           |
| 400 com `details`                                     | tela                   | Erro em cada campo pelo `field`; sem campo conhecido, mensagem geral.                                          |
| 400, 404, 409 sem campo                               | tela                   | `FaixaDeAviso tom="erro"` com `mensagemDaEscrita(erro, generica)`.                                             |
| `NetworkError` em escrita                             | tela                   | `mensagemDaEscrita` devolve "Não foi possível conectar ao servidor."                                           |
| Outro erro de consulta                                | tela                   | `ErrorState` com "Tentar de novo" (`refetch`).                                                                 |

</tabela>

<regras>
- Mensagem exibida é `ErrorResponse.message` (o servidor escreve para a tela) ou a genérica do chamador. Proibido exibir `error.message` de exceção JavaScript, stack ou status numérico.
- Funções de erro: `mensagemDaEscrita`, `mensagemDoErro`, `naoEncontrado`, `escritaRecusada` de `@/shared-domain/administracao`; `acessoRevogado` de `@/auth/acesso-revogado`; `provedorIndisponivel`, `ApiError`, `NetworkError` de `@/api/api-client`.
- Proibido `try/catch` em volta de `mutate`. Leia `mutation.isError` e `mutation.error`.
- Proibido tratar 401 ou 403 genérico na tela.
</regras>

<exemplo>
```ts
// src/pages/pedidos/hooks.ts
export interface FalhaDaEscrita {
  readonly mensagem: string | null;
  readonly erros: Readonly<Record<string, string>>;
}

export function falhaDaEscrita(erro: unknown, textoGenerico: string): FalhaDaEscrita {
const detalhes = erro instanceof ApiError ? (erro.body?.details ?? []) : [];
return {
mensagem: mensagemDaEscrita(erro, textoGenerico),
erros: Object.fromEntries(detalhes.map((detalhe) => [detalhe.field, detalhe.message])),
};
}

```
</exemplo>
```
