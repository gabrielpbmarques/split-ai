# Problemas conhecidos e contornos de bibliotecas

<uso>
- Registro contínuo de travas já investigadas: comportamento de biblioteca externa ou do runtime, contorno aplicado, atalho adotado ou problema sem solução.
- Consulte este arquivo antes de investigar qualquer trava. Registre aqui toda trava nova ao final da investigação, resolvida ou não.
- Regra de arquitetura não entra aqui; entra no arquivo dono. Aqui entra o problema e o link para a regra que o resolve.
</uso>

## Protocolo

<regra critica="true">
Ao encontrar erro, comportamento inesperado ou limitação de biblioteca, siga a ordem abaixo antes de gastar esforço de investigação. Ao concluir a investigação, registre o resultado neste arquivo no mesmo PR da mudança de código.
</regra>

<fluxo>
```
1. Consultar    grep -n "<trecho literal do erro>" 14-problemas-conhecidos.md
                grep -n "<nome-da-biblioteca>" 14-problemas-conhecidos.md
2. Encontrou    status contornado ou atalho → aplicar o contorno registrado; não reinvestigar
                status sem-solucao         → não tentar de novo; seguir a alternativa registrada
                versão da lib mudou        → testar se a entrada ainda vale; atualizar status e versão
3. Não achou    investigar na ordem da tabela "Ordem de contorno"
4. Concluiu     registrar entrada nova (modelo abaixo), inclusive quando não houver solução
5. Removeu      contorno que deixou de ser necessário → status obsoleto, com a versão que corrigiu
```
</fluxo>

<regras>
- Registre quando a investigação passar de uma tentativa: erro não óbvio, causa fora do código do projeto, ou contorno não intuitivo.
- Registre também tentativa que falhou, em "Tentativas descartadas". É isso que impede a próxima sessão de repetir o caminho.
- "Sintoma" contém o texto literal da mensagem de erro, sem parafrasear, ou o comportamento observável. A busca é por `grep`.
- Uma entrada por problema. Problema já registrado é atualizado, não duplicado.
- O identificador é sequencial (`PC-001`, `PC-002`…) e nunca é reaproveitado.
- O código do contorno não referencia a entrada por comentário. O vínculo é o campo "Onde", com o caminho do arquivo.
- Ao atualizar versão de biblioteca listada aqui, revise as entradas dela.
- Comportamento que só aparece com layout real (posição, rolagem, animação) não é coberto pelo `jsdom`: a entrada diz como conferir no navegador.
</regras>

## Ordem de contorno

<tabela>

| #   | Estratégia                                                                                                 | Quando usar                                                                   |
| --- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | Configuração ou prop pública da biblioteca                                                                 | Sempre a primeira tentativa.                                                  |
| 2   | Ponte ou composição em `src/shared/ui/` (para o DS) ou código auxiliar no ponto único de uso da biblioteca | A biblioteca não cobre o caso, mas expõe o necessário para cobri-lo por fora. |
| 3   | Ponto de extensão da biblioteca (callback, adapter, alias de módulo, camada CSS)                           | O gap está dentro do fluxo da biblioteca e ela oferece ponto de extensão.     |
| 4   | Patch com `pnpm patch` + `pnpm patch-commit`                                                               | Não há ponto de extensão. O patch fica em `patches/` e é versionado.          |
| 5   | Registrar como `sem-solucao` com a alternativa adotada                                                     | Nenhuma das anteriores é viável sem custo desproporcional.                    |

</tabela>

<regras>
- Proibido editar arquivo dentro de `node_modules` sem `pnpm patch`.
- Proibido copiar código da biblioteca para dentro do projeto (fork inline). Ponte do DS é a implementação do pedido ao DS, não cópia.
- Patch com `pnpm patch` exige entrada aqui com versão exata da biblioteca; atualizar a versão exige refazer o patch.
- Lacuna do DS também vira pedido ao time do DS. Trocar de biblioteca é decisão do time, não contorno: registre como `sem-solucao` e informe ao solicitante.
</regras>

## Modelo de entrada

<estrutura>
```markdown
### PC-000 — <título curto: biblioteca + comportamento>

| Campo                  | Valor                                                             |
| ---------------------- | ----------------------------------------------------------------- |
| Status                 | contornado \| atalho \| sem-solucao \| obsoleto                   |
| Biblioteca             | `<pacote>@<versão exata>`                                         |
| Sintoma                | `<mensagem de erro literal ou comportamento observável>`          |
| Causa                  | <uma frase>                                                       |
| Solução                | <o que fazer, em modo imperativo>                                 |
| Onde                   | `<caminho/do/arquivo>`                                            |
| Regra dona             | [`NN-arquivo.md`](NN-arquivo.md) ou —                             |
| Tentativas descartadas | <o que não funciona e por quê, em uma frase cada> ou —            |
| Remover quando         | <condição objetiva para o contorno deixar de ser necessário> ou — |
| Registrado em          | AAAA-MM-DD                                                        |

```
</estrutura>

<tabela>

| Status | Significado |
| --- | --- |
| `contornado` | Existe solução aplicada e estável. |
| `atalho` | Solução funciona mas é provisória ou tem custo conhecido; descreva o custo em "Solução". |
| `sem-solucao` | Não há solução viável; "Solução" descreve a alternativa ou a restrição a respeitar. |
| `obsoleto` | Não se aplica mais; "Remover quando" indica a versão que corrigiu. Mantenha a entrada. |

</tabela>

## Registro

### PC-001 — Cache do Vite aponta para o caminho antigo depois de mover arquivo

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `vite@7.3.6` |
| Sintoma | `Failed to load url .../Componente/index.ts ... Does the file exist?` com o arquivo certo no disco. |
| Causa | O cache de dependências em `node_modules/.vite` guarda o caminho antigo do módulo. |
| Solução | Pare o dev server, rode `rm -rf node_modules/.vite` e suba o dev server de novo. |
| Onde | `node_modules/.vite` |
| Regra dona | — |
| Tentativas descartadas | Limpar o cache com o servidor rodando: não resolve. |
| Remover quando | — |
| Registrado em | 2026-10-03 |

### PC-002 — `Link` do DS é âncora crua e recarrega a aplicação

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `@pucpr-ds/react@1.2.0` |
| Sintoma | Clique num link interno recarrega a página; estado React (menu recolhido, filtros em memória) se perde ao navegar. |
| Causa | O `Link` do DS renderiza `<a href>` sem integração com o roteador e sem `asChild`. |
| Solução | Use `InternalLink` de `@/shared/ui` para rota do app (mesma aparência e props, com `Link` do `react-router-dom` por baixo). `type="external"` mantém `<a target="_blank">`. Teste com `renderWithProviders`, que já tem `MemoryRouter`. |
| Onde | `src/shared/ui/primitives/InternalLink.tsx` |
| Regra dona | [`05-design-system-e-estilo.md`](05-design-system-e-estilo.md) |
| Tentativas descartadas | — |
| Remover quando | O `Link` do DS ganhar `asChild`. |
| Registrado em | 2026-10-03 |

### PC-003 — `Chips` do DS sai em branco sem `size="default"`

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `@pucpr-ds/react@1.2.0` |
| Sintoma | Chip vazio na tela, sem erro; `getByText` do rótulo falha no teste. |
| Causa | O componente checa `size === "default"` para renderizar `label`/`children`; o valor padrão do CVA não preenche a prop. |
| Solução | Passe sempre `size="default"`. O botão de fechar interno não tem nome acessível nem aceita `aria-label`: pendência de acessibilidade levada ao time do DS. |
| Onde | `src/shared/ui/primitives/Chips.tsx` e usos de `Chips` |
| Regra dona | — |
| Tentativas descartadas | — |
| Remover quando | O `Chips` do DS renderizar com o tamanho padrão implícito e expor nome acessível no fechar. |
| Registrado em | 2026-10-03 |

### PC-004 — Campo com `label` do DS mostra "(opcional)" por padrão

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `@pucpr-ds/react@1.2.0` |
| Sintoma | Rótulo "Turno (opcional)" em filtro ou seletor que sempre tem valor. |
| Causa | `Input`, `Dropdown` e `TextArea` acrescentam "(opcional)" a todo campo sem `required`. |
| Solução | `required` no campo obrigatório; `showOptionalText={false}` onde "opcional" não faz sentido. |
| Onde | Formulários e filtros em `src/pages/**/components/` |
| Regra dona | [`07-formularios-e-acoes.md`](07-formularios-e-acoes.md) |
| Tentativas descartadas | — |
| Remover quando | — |
| Registrado em | 2026-10-03 |

### PC-005 — Elemento `absolute` sem ancestral `relative` estica a área que rola

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | CSS (posicionamento) + `tailwindcss@4.3.3` (`sr-only`) |
| Sintoma | Cabeçalho e menu lateral "somem" no scroll; rolagem horizontal aparece na área de conteúdo por causa de um `sr-only` no fim de uma tabela. |
| Causa | `position: absolute` se posiciona pelo ancestral posicionado mais próximo; sem ele dentro do contêiner com `overflow`, escapa e estica o documento ou a área. |
| Solução | Mantenha `relative` na área de conteúdo do `AppLayout`, no contêiner que rola da `Table` e no `<form>` de diálogo. Contêiner novo com `overflow` que tem `sr-only` dentro: `relative`. |
| Onde | `src/app/AppLayout.tsx`, `src/shared/ui/primitives/Table.tsx` |
| Regra dona | [`08-acessibilidade.md`](08-acessibilidade.md) |
| Tentativas descartadas | `@container` no `DataGrid`: não vira bloco de contenção de absolutos. |
| Remover quando | — |
| Registrado em | 2026-10-03 |

### PC-006 — Vitest lê o `.env` local e o teste muda de máquina para máquina

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `vitest@3.2.7` |
| Sintoma | Teste passa numa máquina e falha em outra ou na CI; na CI, arquivos que importam `environment` quebram na carga com `Missing environment variables: …`. |
| Causa | O Vitest carrega o `.env` local; `test.env` de `vitest.config.ts` só fixa as `VITE_*` que lista, e a CI não tem `.env`. |
| Solução | Liste em `test.env` toda `VITE_*` lida por `environment.ts`, com as flags desligadas, no mesmo PR que cria a variável. Teste que precisa de outro valor faz `vi.mock('@/config/environment', …)` com getter. |
| Onde | `vitest.config.ts` |
| Regra dona | [`12-testes.md`](12-testes.md) |
| Tentativas descartadas | Sobrescrever a variável pela linha de comando (`VITE_SKIP_AUTH=true pnpm exec vitest`): chave listada em `test.env` vence. |
| Remover quando | — |
| Registrado em | 2026-10-03 |

### PC-007 — `QueryClient` no helper compartilhado quebra mocks parciais do react-query

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `@tanstack/react-query@5.102.7` + `vitest@3.2.7` |
| Sintoma | Testes com `vi.mock('@tanstack/react-query')` parcial (sem `QueryClient`) quebram ao importar o helper de render. |
| Causa | `new QueryClient()` no módulo do helper usa a classe que o mock parcial removeu. |
| Solução | Use `renderWithQueryClient` (arquivo próprio) para teste com react-query e `renderWithProviders` (sem `QueryClientProvider`) para o resto. Não crie `QueryClient` em `src/test/render.tsx`. |
| Onde | `src/test/render.tsx`, `src/test/renderWithQueryClient.tsx` |
| Regra dona | [`12-testes.md`](12-testes.md) |
| Tentativas descartadas | — |
| Remover quando | — |
| Registrado em | 2026-10-03 |

### PC-008 — Prettier por `pnpm exec` no PowerShell não formata e diz que formatou

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `prettier@3.9.6` + shim `pnpm.ps1` (Windows) |
| Sintoma | Sai com código 2 e imprime `All matched files use Prettier code style!`. Arquivo de 0 bytes depois de encadear comando com `\| Select-Object -First N`. |
| Causa | O shim junta a lista de arquivos num argumento só; `Select-Object -First` mata o processo anterior no meio da escrita. |
| Solução | No Windows, rode `node node_modules/prettier/bin/prettier.cjs --write <arquivos>` e confira `$LASTEXITCODE`. Nunca encadeie comando que escreve arquivo com `Select-Object -First`. |
| Onde | Linha de comando |
| Regra dona | — |
| Tentativas descartadas | — |
| Remover quando | — |
| Registrado em | 2026-10-03 |

### PC-009 — CSS do DS vence as variantes responsivas do app

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `tailwindcss@4.3.3` + `@pucpr-ds/react@1.2.0` |
| Sintoma | Conteúdo do `PageHeader` centralizado e empilhado no desktop; rótulos com `md:not-sr-only` escondidos. |
| Causa | `@pucpr-ds/react/styles` traz utilities base (`.flex-col`, `.sr-only`) em `@layer utilities`; importado depois das do app, na mesma camada, vence `lg:`/`md:` porque media query não soma especificidade. |
| Solução | Mantenha `@layer theme, base, ds, components, utilities;` e `@import '@pucpr-ds/react/styles' layer(ds);` em `src/styles/index.css`. |
| Onde | `src/styles/index.css` |
| Regra dona | [`05-design-system-e-estilo.md`](05-design-system-e-estilo.md) |
| Tentativas descartadas | — |
| Remover quando | — |
| Registrado em | 2026-10-03 |

### PC-010 — Utility que só existe no CSS do DS perde para qualquer utility do app

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `tailwindcss@4.3.3` + `@pucpr-ds/tokens@1.0.0` |
| Sintoma | `focus-visible:shadow-focus-blue` num controle com `shadow-level-1` não mostra anel de foco, sem erro. |
| Causa | Com o DS em `layer(ds)`, classe que o app usa mas não gera (token ausente do `@theme`) fica só na camada `ds` e perde para utility do app na mesma propriedade. `@pucpr-ds/tokens` não publica `--shadow-focus-blue`. |
| Solução | Antes de usar classe de token do DS, confirme que ela sai no CSS do app (`pnpm build`, procurar fora do bloco do DS em `dist/assets/*.css`). Não saiu: declare o token no `@theme` de `src/styles/theme.css`. `src/styles/theme.test.ts` compara o anel de foco com o CSS compilado do DS. |
| Onde | `src/styles/theme.css`, `src/styles/theme.test.ts` |
| Regra dona | [`05-design-system-e-estilo.md`](05-design-system-e-estilo.md) |
| Tentativas descartadas | — |
| Remover quando | `@pucpr-ds/tokens` publicar o token. |
| Registrado em | 2026-10-03 |

### PC-011 — `cn` do DS descarta tamanho de texto de token e não deduplica raio

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `@pucpr-ds/react@1.2.0` (`tailwind-merge` sem configuração) |
| Sintoma | Componente do DS no tamanho padrão mesmo com `text-body-sm` no `className`; raio ou sombra de `className` ignorados ou duplicados. |
| Causa | O `twMerge` sem configuração lê `text-caption`, `text-body-*` e `text-heading-*` como cor e os descarta ao lado de outra cor; não reconhece `rounded-<token>`; trata `shadow-level-*` como cor de sombra. |
| Solução | Em componente do DS, escreva `[&]:text-<token>`. Raio, sombra e respiro do `Card` saem das props `raio`, `sombra` e `respiro`. `text-body-md` não existe. |
| Onde | `src/shared/ui/primitives/*.tsx` e `className` passado a componente do DS |
| Regra dona | [`05-design-system-e-estilo.md`](05-design-system-e-estilo.md) |
| Tentativas descartadas | — |
| Remover quando | O DS configurar o `tailwind-merge` com os tokens. |
| Registrado em | 2026-10-03 |

### PC-012 — `rounded-full` vale 50%, não pílula

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `@pucpr-ds/tokens@1.0.0` |
| Sintoma | Botão ou selo retangular com `rounded-full` vira elipse. |
| Causa | `--border-radius-full` do DS vale `50%`, e `--radius-full` do tema aponta para ele. |
| Solução | Pílula: `rounded-pill` (`9999px`). `rounded-full` só em elemento quadrado (círculo). |
| Onde | `src/styles/theme.css` |
| Regra dona | [`05-design-system-e-estilo.md`](05-design-system-e-estilo.md) |
| Tentativas descartadas | — |
| Remover quando | — |
| Registrado em | 2026-10-03 |

### PC-013 — Slot `icon` do `Button` deforma svg filho direto

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `@pucpr-ds/react@1.2.0` |
| Sintoma | Ícone achatado em 18×14 px dentro do botão; classe no próprio svg não corrige. |
| Causa | O slot aplica `[&>svg]:!w-[18px] [&>svg]:!h-[14px]` com `!important` ao filho direto. |
| Solução | Passe `<Icone nome="…" />`, que embrulha o svg num `span` com o tamanho do ícone. Nunca svg cru no slot. |
| Onde | `src/shared/ui/Icone.tsx` |
| Regra dona | [`05-design-system-e-estilo.md`](05-design-system-e-estilo.md) |
| Tentativas descartadas | Classe de tamanho no svg: perde para o `!important`. |
| Remover quando | — |
| Registrado em | 2026-10-03 |

### PC-014 — `Dropdown` do DS não usa portal e é cortado por `overflow`

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `@pucpr-ds/react@1.2.0` |
| Sintoma | Lista de opções some dentro de seção de acordeão aberta ou de contêiner com rolagem; `h-*` não baixa a altura do botão. |
| Causa | A lista abre em `absolute z-50 top-full` dentro do componente; `AccordionItem` com `border` e `AccordionContent` têm `overflow-hidden`; o botão tem `min-h-12` (`min-h-14` no `large`). |
| Solução | Em código novo, use `Seletor` (ponte com portal e teclado). Onde o `Dropdown` fica: `ItemAcordeaoCartao` mantém `overflow-visible` e `[&>[data-state=open]]:overflow-visible`; altura menor por `min-h` (`DropdownCompacto`, `[&_button]:min-h-10`). |
| Onde | `src/shared/ui/primitives/ItemAcordeaoCartao.tsx`, `src/shared/ui/primitives/DropdownCompacto.tsx`, `src/shared/ui/primitives/Seletor.tsx` |
| Regra dona | [`05-design-system-e-estilo.md`](05-design-system-e-estilo.md) |
| Tentativas descartadas | `h-*` no botão: o `min-h` vence. |
| Remover quando | O `Dropdown` do DS usar portal. |
| Registrado em | 2026-10-03 |

### PC-015 — `asChild` do `Button` do DS quebra a renderização

| Campo | Valor |
| --- | --- |
| Status | sem-solucao |
| Biblioteca | `@pucpr-ds/react@1.2.0` + `radix-ui@1.6.7` (`Slot`) |
| Sintoma | `Slot failed to slot onto its children` |
| Causa | O `Button` sempre entrega ao `Slot` um array `[ícone ou false, conteúdo]`, e o `Slot` exige um único elemento. |
| Solução | Para navegar com cara de botão, use `Button`/`ButtonVariante` com `onClick={() => void navigate(rota)}`. Para link de rota, `InternalLink`. |
| Onde | Qualquer uso de `Button` |
| Regra dona | [`05-design-system-e-estilo.md`](05-design-system-e-estilo.md) |
| Tentativas descartadas | — |
| Remover quando | O `Button` do DS passar um único filho ao `Slot`. |
| Registrado em | 2026-10-03 |

### PC-016 — Fonte do corpo cai na sans-serif do sistema

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `@fontsource-variable/source-sans-3@5.3.0` + `@pucpr-ds/tokens@1.0.0` |
| Sintoma | Corpo do texto em fonte do sistema, sem erro. |
| Causa | O pacote registra a família como "Source Sans 3 Variable", e o token do DS pede "Source Sans 3". |
| Solução | Mantenha o alias de `--font-family-source` em `src/styles/tokens.css` ao atualizar os tokens. |
| Onde | `src/styles/tokens.css` |
| Regra dona | [`05-design-system-e-estilo.md`](05-design-system-e-estilo.md) |
| Tentativas descartadas | — |
| Remover quando | — |
| Registrado em | 2026-10-03 |

### PC-017 — Consulta disparada com permissões antigas recebe 403 e tira a pessoa da rota

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `@tanstack/react-query@5.102.7` |
| Sintoma | Na troca de persona, de data simulada ou no reinício dos dados, a tela vai para `/sem-permissao` mesmo com acesso; persona que volta monta a tela com o `/me` antigo. |
| Causa | O react-query só avisa os componentes do `/me` novo num tick depois que `invalidateQueries` resolve; consultas relidas antes disso saem com o contexto anterior. O cache inativo de outro mundo vira dado firme ao voltar. |
| Solução | Mantenha as três peças: `RotaComPermissao` mostra esqueleto enquanto o `/me` é `isPlaceholderData`; `atualizarConsultasDoMundo` invalida o `/me`, espera o tick (`notifyManager.schedule`) e só então invalida as demais; no fim, `removeQueries({ type: 'inactive' })`. |
| Onde | `src/app/RotaComPermissao.tsx`, `src/auth/atualizar-consultas-do-mundo.ts`, `src/app/SeletorDePersona.tsx` |
| Regra dona | [`09-autenticacao-e-permissoes.md`](09-autenticacao-e-permissoes.md) |
| Tentativas descartadas | Invalidar todas as consultas de uma vez: as da tela disparam com o `/me` antigo. |
| Remover quando | — |
| Registrado em | 2026-10-03 |

### PC-018 — Conversão de dia com `Date` erra por um dia

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | runtime JavaScript (`Date`, fuso do navegador) |
| Sintoma | Vigência exibida ou enviada com um dia a mais ou a menos, sem aviso; muda em navegador fora do fuso de Brasília. |
| Causa | A API usa fim exclusivo em instante ISO; a tela usa dia de calendário com o último dia incluído. `new Date('AAAA-MM-DD')` e soma de dia operam no fuso do navegador. |
| Solução | Use `instanteDoInicioDoDia`, `instanteDepoisDoDia`, `diaEmBrasilia` e `ultimoDiaAntesDe` de `@/shared/contracts`. Teste os dias de borda (último dia do mês, primeiro do seguinte) com a data simulada. |
| Onde | `src/shared/contracts/vigencia.ts` |
| Regra dona | [`04-dados-do-servidor.md`](04-dados-do-servidor.md) |
| Tentativas descartadas | — |
| Remover quando | — |
| Registrado em | 2026-10-03 |

### PC-019 — Flag de runtime leva a simulação para o bundle de produção

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `vite@7.3.6` (substituição de `import.meta.env` e eliminação de código morto) |
| Sintoma | Build de qa, uat ou produção contém `prototipo:mundo`; lint, tipos e testes passam. |
| Causa | O Vite só dobra para `false` a expressão que compara `import.meta.env.VITE_*` literalmente; valor derivado em runtime mantém o `import()` da simulação no bundle. |
| Solução | `prototipoAtivo` compara `import.meta.env.VITE_*` na própria expressão. Código só do protótipo entra por `import()`/`lazy` atrás dele. A CI procura `prototipo:mundo` em `dist/assets`. |
| Onde | `src/config/environment.ts`, `src/main.tsx`, `src/app/App.tsx` |
| Regra dona | [`10-prototipo-e-simulacao.md`](10-prototipo-e-simulacao.md) |
| Tentativas descartadas | Usar o valor validado de `environment` (`values.VITE_PROTOTIPO`): não é dobrado no build. |
| Remover quando | — |
| Registrado em | 2026-10-03 |

### PC-020 — `nextstepjs` importa `next/navigation` fora do Next.js

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `nextstepjs@2.3.0` |
| Sintoma | Build e testes falham resolvendo o pacote `next/navigation`. |
| Causa | A biblioteca importa `next/navigation` mesmo usando o adapter de React Router. |
| Solução | Alias `next/navigation` → `src/shared-domain/tutorial/next-navigation-shim.ts` em `vite.config.ts` e em `vitest.config.ts` (o segundo não herda o alias do primeiro). |
| Onde | `vite.config.ts`, `vitest.config.ts`, `src/shared-domain/tutorial/next-navigation-shim.ts` |
| Regra dona | [`11-tutorial-guiado.md`](11-tutorial-guiado.md) |
| Tentativas descartadas | — |
| Remover quando | — |
| Registrado em | 2026-10-03 |

### PC-021 — `nextstepjs` rola a tela sozinho e prende spotlight e card no passo anterior

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `nextstepjs@2.3.0` + `motion@13.4.4` |
| Sintoma | Abrir o tutorial no topo rola a página; ao trocar de passo, realce e card ficam na posição do passo anterior, deslocados do alvo. |
| Causa | O `useInView(observeRef)` interno nunca recebe elemento, então `isInView` é sempre falso e a lista chama `scrollIntoView`; a geometria só é recalculada em `resize`. |
| Solução | Ligue `noInViewScroll`. Dispare `window.dispatchEvent(new Event('resize'))` num `setTimeout(…, 0)` em `onStart` e `onStepChange`. Confira a troca de todos os passos no navegador: `jsdom` não faz layout. |
| Onde | `src/app/TutorialProvider.tsx` |
| Regra dona | [`11-tutorial-guiado.md`](11-tutorial-guiado.md) |
| Tentativas descartadas | — |
| Remover quando | A biblioteca associar o `ref` do `useInView` e recalcular a geometria na troca de passo. |
| Registrado em | 2026-10-03 |

### PC-022 — `nextstepjs` mede e trava o scroll pelo `body`, que nunca rola

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `nextstepjs@2.3.0` |
| Sintoma | Card sai do campo de visão em passo cujo alvo exige rolagem; a pessoa rola o fundo com o tour aberto. |
| Causa | Sem `viewportID`, a lib mede relativo a `document.body`; quem rola é a área de conteúdo do `AppLayout`. A lib não trava scroll, só bloqueia clique. |
| Solução | `comPadroesDoTour` injeta `viewportID: ID_DA_AREA_ROLAVEL_DO_LAYOUT` em todo passo; `useTravaDeScrollDoTour` aplica `overflow-y: hidden` na área enquanto o passo está visível. Não declare `viewportID` no `tour.ts`. |
| Onde | `src/app/TutorialProvider.tsx`, `src/shared-domain/tutorial/ids.ts` |
| Regra dona | [`11-tutorial-guiado.md`](11-tutorial-guiado.md) |
| Tentativas descartadas | — |
| Remover quando | — |
| Registrado em | 2026-10-03 |

### PC-023 — Card do tour fica fora da tela com alvo alto

| Campo | Valor |
| --- | --- |
| Status | atalho |
| Biblioteca | `nextstepjs@2.3.0` |
| Sintoma | Alvo visível, card (e o botão "Concluir") fora da área visível, sem como rolar até ele. |
| Causa | O `scrollIntoView` da lib cola a borda do alvo na borda da área; o card flutua fora do alvo e fica sem espaço. |
| Solução | `corrigirPosicaoDoNextStep` refaz o `scrollIntoView` com `behavior: 'instant'` e `scroll-margin` temporário do lado oposto ao card, calculado com a altura medida do card; quando alvo e card não cabem, o card manda (`rolagemDoPasso`). Custo: em página curta ou alvo perto do topo não há rolagem para redistribuir; aponte o passo para um alvo menor (`thead`, título da seção). Confira o último passo numa janela de cerca de 600px. |
| Onde | `src/app/TutorialProvider.tsx`, `src/app/rolagem-do-tour.ts` |
| Regra dona | [`11-tutorial-guiado.md`](11-tutorial-guiado.md) |
| Tentativas descartadas | `scroll-margin` fixo de 280px: card mais alto deixava o botão fora de uma janela de 609px. `behavior: 'smooth'`: o `resize` sintético grava a posição antes da animação terminar. |
| Remover quando | — |
| Registrado em | 2026-10-03 |

### PC-024 — Faixa do menu lateral fica sem escurecer durante o tour

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `nextstepjs@2.3.0` |
| Sintoma | Ao recolher ou expandir o menu lateral com o tour aberto, a borda do menu aparece sem o escurecimento. |
| Causa | O segundo overlay (`nextstep-overlay2`, com `viewportID`) só recalcula em troca de passo e `resize`; a transição de largura do menu não dispara `resize`. |
| Solução | `AppLayout` dispara `resize` sintético (`setTimeout` de 220ms) no `useEffect` do estado `collapsed`, ignorando o primeiro render. Dispare sempre do código que sabe quando o layout muda. |
| Onde | `src/app/AppLayout.tsx` |
| Regra dona | [`11-tutorial-guiado.md`](11-tutorial-guiado.md) |
| Tentativas descartadas | `ResizeObserver` no elemento do `viewportID`: travou a aba (CPU no teto) em conflito com o `ResizeObserver` que a lib já registra no alvo. |
| Remover quando | — |
| Registrado em | 2026-10-03 |

### PC-025 — `nextRoute` do último passo é ignorado

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `nextstepjs@2.3.0` |
| Sintoma | "Concluir" do último passo fecha o tour e não navega. |
| Causa | `nextStep()` só lê `nextRoute` ao avançar entre passos; no último, chama `onComplete()` e `closeNextStep()`. |
| Solução | O `onComplete` do `TutorialProvider` lê o `nextRoute` do último passo e navega com `useNavigate` do `react-router-dom`. Tela da jornada não usa `nextRoute` no último passo: o passo "A seguir" é gerado. |
| Onde | `src/app/TutorialProvider.tsx` |
| Regra dona | [`11-tutorial-guiado.md`](11-tutorial-guiado.md) |
| Tentativas descartadas | `navigationAdapter` do nextstepjs: só serve para a lib chamar internamente. |
| Remover quando | — |
| Registrado em | 2026-10-03 |

### PC-026 — `nextstepjs` desiste do seletor que ainda não existe

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `nextstepjs@2.3.0` |
| Sintoma | Tour de página com consulta não abre sozinho, ou abre só às vezes, sem erro. |
| Causa | `selectorRetryAttempts` vale `0` por padrão: uma busca síncrona do alvo, que perde a corrida contra o carregamento da página. |
| Solução | `comPadroesDoTour` dá a todo passo `selectorRetryAttempts` 25 × `selectorRetryDelay` 200ms. Alvo que só existe em certo estado de negócio vira passo final sem `selector`; tela com variantes registra o tour da variante (`undefined` enquanto o dado não carregou). |
| Onde | `src/app/TutorialProvider.tsx` |
| Regra dona | [`11-tutorial-guiado.md`](11-tutorial-guiado.md) |
| Tentativas descartadas | — |
| Remover quando | — |
| Registrado em | 2026-10-03 |

### PC-027 — Tour parece parado em aba de fundo

| Campo | Valor |
| --- | --- |
| Status | sem-solucao |
| Biblioteca | `motion@13.4.4` + navegador (`requestAnimationFrame`) |
| Sintoma | Realce e card não se movem ao trocar de passo durante conferência por automação. |
| Causa | Com `document.visibilityState === 'hidden'`, o navegador não dispara `requestAnimationFrame`. |
| Solução | Confira com a aba em primeiro plano. Em automação, meça a geometria final (rolagem, posição do alvo, lado e altura do card), não a posição animada. |
| Onde | — |
| Regra dona | [`11-tutorial-guiado.md`](11-tutorial-guiado.md) |
| Tentativas descartadas | — |
| Remover quando | — |
| Registrado em | 2026-10-03 |

### PC-028 — Adapter de rota do `nextstepjs` não enxerga o router do teste

| Campo | Valor |
| --- | --- |
| Status | contornado |
| Biblioteca | `nextstepjs@2.3.0` + `react-router-dom@7.18.2` + `vitest@3.2.7` |
| Sintoma | `useNavigate() may be used only in the context of a <Router>` |
| Causa | `nextstepjs/adapters/react-router` importa de `react-router`, que no Vitest é outra instância do módulo usado pelo `MemoryRouter`; no app, o Vite deduplica. |
| Solução | Teste que monta o `TutorialProvider` sem mockar o `nextstepjs` troca o adapter por um sobre `react-router-dom` e define `scrollTo` na janela e no elemento do `jsdom`. Modelo em `src/app/jornada.integracao.test.tsx`. |
| Onde | `src/app/jornada.integracao.test.tsx` |
| Regra dona | [`12-testes.md`](12-testes.md) |
| Tentativas descartadas | — |
| Remover quando | — |
| Registrado em | 2026-10-03 |
```
