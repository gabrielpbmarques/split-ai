# Topologia do projeto

## Raiz

<estrutura>
```
.
├── src/                    código-fonte
├── scripts/criar-pagina.mjs   gera o esqueleto de uma página (pnpm criar:pagina)
├── index.html
├── vite.config.ts          alias @, plugins react + tailwindcss, manualChunks, porta 5173
├── vitest.config.ts        jsdom, setup, env fixo das VITE_*, cobertura
├── tsconfig.json
├── eslint.config.mjs       fronteiras de import (no-restricted-imports)
├── .prettierrc / .editorconfig
├── .env.example            toda VITE_* lida pelo app
├── .npmrc                  registro privado do DS (token por variável de ambiente)
├── Dockerfile / nginx.conf
└── package.json
```
</estrutura>

## `src/`

<estrutura>
```
src/
  main.tsx                ponto de entrada: inicializa o MSAL, instala a simulação (protótipo) e monta <App />
  vite-env.d.ts           tipos de import.meta.env
  app/                    casca autenticada: App.tsx (providers), routes.tsx, AppLayout, AppHeader,
                          menu, RotaComPermissao, ErrorBoundary, query-client.ts, TutorialProvider
  auth/                   MSAL, ProtectedRoute, token, sessão expirada, /me, contexto ativo, permissões efetivas
  api/                    cliente HTTP (api-client.ts), useApi.ts, transporte.ts
  config/                 environment.ts: variáveis de ambiente validadas na carga
  pages/                  uma pasta por tela
    <pagina>/             forma fixa: ver 03-anatomia-da-pagina.md
  shared-domain/          regra de negócio usada por 2+ páginas, mesma forma de uma página
    <assunto>/
  shared/                 genérico, sem regra de negócio
    ui/                   ponto único de import de componentes (DS + composições + pontes)
      primitives/         pontes para o que falta no DS
    contracts/            tipos de request/response da API, cabeçalhos, ErrorResponse, conversões de vigência
    hooks/                hooks genéricos, um arquivo por hook (useAlgo.ts)
    constants/            constantes genéricas, um arquivo por assunto
  simulacao/              servidor simulado do protótipo (só carregado por main.tsx)
    dados/                seed
    rotas/                rotas simuladas por recurso
  styles/                 index.css (ordem obrigatória), tokens.css, theme.css (@theme), base.css
  test/                   setup.ts e helpers de render e de integração (só testes importam)
```
</estrutura>

<regras>
- `app/`: dono de estado de navegação e de sessão (menu aberto, contexto ativo, sessão expirada). Fica acima do `<Outlet />`.
- `shared/ui/`: composição de UI sem estado de navegação nem de sessão, mesmo quando parece casca de tela (`Page`, `PageHeader`, `Section`, `StatusMessage`).
- Teste de lugar: o componente navega ou lê sessão/autenticação → `app/`. Só compõe DS → `shared/ui/`.
- `shared/`: não importa de `app/`, `auth/`, `api/`, `pages/`, `shared-domain/` nem `simulacao/`.
- `pages/`: uma pasta por tela. Sem pasta `features/` nem agrupamento por domínio.
- Teste fica ao lado do arquivo testado (`Componente.tsx` + `Componente.test.tsx`). Teste de integração da casca fica em `src/app/` (`*.integracao.test.tsx`).
- Fronteiras de import entre pastas: [`02-convencoes-fundamentais.md`](02-convencoes-fundamentais.md).
</regras>

## `main.tsx`

<regras>
Ordem obrigatória:

1. Importar `@/styles/index.css` uma única vez, aqui.
2. Buscar `#root`; ausente, lançar `Error`.
3. `msalInstance.initialize()` → `msalInstance.handleRedirectPromise()`.
4. Se `prototipoAtivo`: `const { instalarSimulacao } = await import('./simulacao')` e `instalarSimulacao()`. Este é o único `import()` da simulação no código de produção.
5. `createRoot(root).render(<StrictMode><App /></StrictMode>)`.
6. Falha da inicialização: `console.error` e texto de erro em português no `root`.
</regras>

## Árvore de providers (`src/app/App.tsx`)

<estrutura>
```
PucProvider
  ErrorBoundary
    MsalProvider
      QueryClientProvider (queryClient de app/query-client.ts)
        SessaoExpiradaProvider
          BrowserRouter
            RedirecionadorSemPermissao
            Suspense
              TutorialProvider (lazy, só no protótipo; fora dele, SemTutorial)
                AppRoutes
            SeletorDePersona (só no protótipo)
          SessaoExpiradaDialog
          AlternadorDePerfil (só com o mock do provedor de identidade)
  Toaster
```
</estrutura>

<regras>
- Provider novo entra em `App.tsx`, no nível mais baixo que atende todos os consumidores.
- Componente exclusivo de um modo (`prototipoAtivo`, `entraMockAtivo`) é renderizado com `modo ? <X /> : null`.
- Módulo carregado só no protótipo usa `lazy(() => import('./Arquivo'))` atrás de `prototipoAtivo`, com caminho literal.
</regras>

## Configuração de ambiente

<exemplo>
```ts
// src/config/environment.ts
const REQUIRED = [
  'VITE_APP_ENV',
  'VITE_ENTRA_TENANT_ID',
  'VITE_ENTRA_CLIENT_ID',
  'VITE_ENTRA_API_SCOPE',
  'VITE_ENTRA_REDIRECT_URI',
  'VITE_API_URL',
] as const;

const values = require();

export const environment = {
appEnv: values.VITE_APP_ENV,
apiUrl: values.VITE_API_URL,
} as const;

export const skipAuth = environment.appEnv === 'local' && values.VITE_SKIP_AUTH === 'true';

export const prototipoAtivo =
import.meta.env.VITE_APP_ENV === 'local' &&
import.meta.env.VITE_SKIP_AUTH === 'true' &&
import.meta.env.VITE_PROTOTIPO === 'true';

````
</exemplo>

<regras>
- `import.meta.env` só é lido em `src/config/environment.ts`. O resto do código importa `environment`, `skipAuth`, `prototipoAtivo`, `entraMockAtivo`, `entraMockUrl`, `isEphemeral`.
- Variável obrigatória ausente ou `VITE_APP_ENV` fora de `local | qa | uat | production` lança `Error` na carga.
- Flag de desenvolvimento só tem efeito com `VITE_APP_ENV === 'local'`. Nunca funciona em qa, uat ou produção.
- Flag que decide se código entra no bundle compara `import.meta.env.VITE_*` literalmente na própria expressão. Ver [`10-prototipo-e-simulacao.md`](10-prototipo-e-simulacao.md).
- Variável nova, no mesmo PR: `vite-env.d.ts` (tipo), `environment.ts`, `.env.example` (com comentário de efeito) e `test.env` de `vitest.config.ts` (flag desligada). Ver [`12-testes.md`](12-testes.md).
- Segredo nunca vai para `VITE_*`: tudo em `VITE_*` é público no bundle.
</regras>

## Imports

<regras>
- Único path alias: `"@/*": ["./src/*"]`.
- Fora da própria pasta de página ou de `shared-domain/<assunto>/`: import absoluto com `@/`.
- Dentro da própria pasta: import relativo (`./api`, `./hooks`, `../types`, `./components/TabelaDePedidos`).
- Proibido import relativo que sai da pasta (`../../`). Use `@/`.
- Ordem: pacotes externos → `@/` → relativos. `import type` em linha própria, logo após o import de valor do mesmo módulo.
- Barril (`index.ts`) existe só na raiz de cada página, de cada `shared-domain/<assunto>/`, em `shared/ui/` e em `shared/contracts/`. Proibido `index.ts` por componente.
</regras>

<exemplo>
```ts
// src/pages/pedidos/hooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/api/useApi';
import { useChaveDoContexto } from '@/auth/useChaveDoContexto';
import { prototipoAtivo } from '@/config/environment';
import type { PedidoDaLista } from '@/shared/contracts';
import { atualizarConsultasDepoisDaEscrita } from '@/shared-domain/administracao';
import { aprovarPedido, listarPedidos, obterPedido } from './api';
import type { FiltrosDePedidos } from './types';
````

</exemplo>

## Ferramentas

<regras>
- Prettier: `semi`, `singleQuote`, `trailingComma: 'all'`, `printWidth: 100`, `tabWidth: 2`, `endOfLine: 'lf'`.
- TypeScript: `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `isolatedModules`.
- `any` é erro de lint. Exceção: arquivos de teste.
- `console.log` é erro de lint. Só `console.error` é permitido, para falha sem outro canal.
- `eqeqeq` e `prefer-const` são erro de lint.
- `@typescript-eslint/consistent-type-imports` com `prefer: 'type-imports'`: tipo importado só como tipo usa `import type`.
- Variável ou parâmetro não usado é erro; prefixe com `_` quando a assinatura exige o parâmetro.
- Fronteiras de import são forçadas por `no-restricted-imports` e `no-restricted-syntax` em `eslint.config.mjs`. Regra nova de fronteira entra ali.
- Proibido `eslint-disable`. Proibido `--fix` para mascarar erro.
- Proibido `@ts-ignore` e `@ts-expect-error` em código de produção.
- Não atualizar versão de `@pucpr-ds/react`, `nextstepjs`, `react`, `react-router-dom`, `@tanstack/react-query`, `vite` ou `typescript` sem solicitação explícita. Atualizar versão listada em [`14-problemas-conhecidos.md`](14-problemas-conhecidos.md) exige revisar as entradas dela.
- Dependência nova só com aprovação do solicitante. Proibida biblioteca de componentes pronta (MUI, Ant, Chakra e similares).
</regras>

## Verificação antes de concluir uma tarefa

<checklist>
```bash
pnpm format          # depois confira com pnpm format:check
pnpm lint            # limpo, sem --fix e sem eslint-disable
pnpm typecheck
pnpm test            # vitest run
pnpm build           # tsc -b && vite build
```

`pnpm verify` encadeia lint, typecheck, test e build. Rode antes de abrir PR.

Se tocou flag de ambiente, `main.tsx` ou `simulacao/`: `pnpm build` e confirme que `dist/assets/*.js` não contém `prototipo:mundo`.
</checklist>
