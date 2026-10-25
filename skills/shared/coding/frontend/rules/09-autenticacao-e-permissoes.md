# Autenticação e permissões

## Modos de autenticação

<tabela>

| Modo                           | Condição (`src/config/environment.ts`)                    | Origem do token                                | Permissões                               |
| ------------------------------ | --------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------- |
| Real                           | padrão                                                    | MSAL: `acquireTokenSilent` com o escopo da API | `/me` da API                             |
| Sem login                      | `skipAuth` (`VITE_APP_ENV=local` e `VITE_SKIP_AUTH=true`) | Token fixo de desenvolvimento                  | Todas liberadas na interface             |
| Mock do provedor de identidade | `entraMockAtivo` (`skipAuth` + `VITE_ENTRA_MOCK_URL`)     | Mock da API, com alternador de perfil          | `/me` da API                             |
| Protótipo                      | `prototipoAtivo` (`skipAuth` + `VITE_PROTOTIPO=true`)     | `prototipo:<personaId>` da persona escolhida   | `/me` do servidor simulado, por contexto |

</tabela>

<regra critica="true">
O token só é obtido por `useAccessToken()` e só é enviado pelo cliente HTTP. Proibido gravar token em `localStorage`, `sessionStorage`, cookie ou estado React. O cache do MSAL é a única cópia.

Uma segunda cópia do token fica fora da renovação, da revogação e do logout que o MSAL controla.
</regra>

<regras>
- Toda rota autenticada fica dentro de `<ProtectedRoute><AppLayout /></ProtectedRoute>` em `src/app/routes.tsx`. Sem sessão no modo real, `ProtectedRoute` dispara `loginRedirect`; no protótipo, leva a `/entrar` guardando a rota de origem.
- Rota pública é exceção explícita fora do `ProtectedRoute` (`/entrar`, só no protótipo).
- `InteractionRequiredAuthError` na renovação abre o diálogo de sessão expirada (`useSessaoExpirada().notificar`). 401 da API também.
- Correlação de pessoa pela identidade do provedor fica no backend. O frontend usa o `id` do `/me`.
- Modo novo de autenticação ou flag nova: só com `VITE_APP_ENV === 'local'`, travado em `environment.ts`.
</regras>

## Acesso do usuário (`/me`) e contexto

<regras>
- `useAcessoDoUsuario()` (`@/auth/useAcessoDoUsuario`) consulta `me` com chave `[...CHAVE_DO_ACESSO, personaId]` e `placeholderData: keepPreviousData`.
- Pessoa com mais de um papel tem `contextos`; o ativo vem de `useContextoAtivo(acesso.data)` (`contextos`, `contextoAtivo`, `trocarContexto`). No protótipo, o contexto vai no cabeçalho `x-contexto-id`.
- Dado da tela que depende do contexto: consulta com `...useChaveDoContexto()` na chave. Ver [`04-dados-do-servidor.md`](04-dados-do-servidor.md).
- Trocar contexto dentro de uma tela: `trocarContexto(id)` seguido de `void atualizarConsultasDepoisDaEscrita(queryClient)`.
- Rótulo do contexto ativo no subtítulo: `contextoAtivo?.rotulo`.
</regras>

## Permissões efetivas

<regras>
- `usePermissoesEfetivas()` (`@/auth/permissoes-efetivas`) devolve uma união: `carregando`, `revogado`, `liberado`, `erro`, `lista` (com `permissoes` e `semPerfilVigente`).
- Pergunta pontual: `temPermissao(permissoes, PERMISSOES.<chave>)`. `carregando`, `revogado` e `erro` respondem `false`; `liberado` responde `true`.
- Chave de permissão vem de `PERMISSOES` (`@/shared-domain/acesso`). Proibida string literal de permissão em componente.
- Permissão nova: entrada em `PERMISSOES` com nome `verbo + objeto` em camelCase e valor `DOMINIO.RECURSO.ACAO` igual ao da API (`aprovarPedidos: 'PEDIDOS.PEDIDO.APROVAR'`).
- Acesso à tela não é verificado dentro da página: `RotaComPermissao` já guarda a rota.
- Dentro da tela, `temPermissao` decide só parte opcional que não pertence a um recurso carregado (botão de exportar, botão de criar). Ação sobre recurso: `BotaoAcao`. Ver [`07-formularios-e-acoes.md`](07-formularios-e-acoes.md).
</regras>

<exemplo>
```tsx
// src/pages/pedidos/Pedidos.tsx
const permissoes = usePermissoesEfetivas();
const podeExportar = temPermissao(permissoes, PERMISSOES.exportarPedidos);

<PageHeader
title="Pedidos"
actions={
podeExportar ? (
<BotaoExportar
        titulo="Exportar pedidos"
        descricao="Gera o arquivo com os pedidos, respeitando os filtros."
        onExportar={exportar}
      />
) : null
}
/>

```
</exemplo>

## Destinos, menu e rotas

<regra critica="true">
Toda tela autenticada é um destino em `DESTINOS` (`src/shared-domain/acesso/destinos.ts`) e é montada por `rotasDosDestinos()` dentro de `RotaComPermissao`. Proibido `<Route>` autenticada solta em `routes.tsx`.

Rota fora de `DESTINOS` não aparece no menu nem no início, não é guardada por permissão e não respeita o modo da aplicação.
</regra>

<tabela>

| Campo do destino | Regra |
| --- | --- |
| `id` | kebab-case, chave em `TELAS_JA_DISPONIVEIS` |
| `rotulo` | nome no menu, no início e na mensagem de 403 |
| `descricao` | uma frase, mostrada no cartão do início |
| `rota` | caminho base; sub-rotas da mesma guarda ficam no array do destino |
| `permissao` | `PERMISSOES.<chave>` ou `null` (sem exigência) |
| `permissaoNoPrototipo` | só quando a chave no protótipo difere da real |
| `icone` | `NomeDoIcone` |
| `etapa` | etapa do protótipo em que a tela chega; acima de `ETAPA_ATUAL_DO_PROTOTIPO` abre "em construção" |
| `modo` | `prototipo`, `real` ou `ambos`; fora do modo, "Tela indisponível neste modo" |
| `noMenu`, `noInicio` | aparece no menu lateral e no início |

</tabela>

<fluxo>
```

URL autenticada
→ ProtectedRoute (sessão)
→ AppLayout (revogado → AcessoRevogado; NetworkError → SemConexao; 503 → ProvedorIndisponivel;
erro do /me → tentar de novo; sem perfil vigente → SemPerfilVigente)
→ RotaComPermissao
fora do modo → "Tela indisponível neste modo"
carregando ou /me placeholder → EsqueletoDeTela "Carregando suas permissões"
sem permissão → SemPermissao no lugar, sem mudar a URL
permitido → tela

```
</fluxo>

<regras>
- Menu e início são derivados de `DESTINOS` e das permissões. A página não se cadastra no menu de outro jeito.
- 403 de consulta leva a `/sem-permissao` (global). 403 de escrita vira toast (global). 403 `ACESSO_REVOGADO` vira "Seu acesso foi revogado" na casca.
- `RotaComPermissao` mostra o esqueleto enquanto o `/me` é `isPlaceholderData`. Não remova essa guarda. Ver [`14-problemas-conhecidos.md`](14-problemas-conhecidos.md).
- Rota inexistente: `NotFound` (`path="*"` dentro do layout).
</regras>
```
