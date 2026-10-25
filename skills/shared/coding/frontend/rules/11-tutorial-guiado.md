# Tutorial guiado

Armadilhas da biblioteca de tour: [`14-problemas-conhecidos.md`](14-problemas-conhecidos.md).

## Onde vive

<regras>
- O tutorial só existe no protótipo. `TutorialProvider` (`src/app/TutorialProvider.tsx`) é carregado por `lazy` atrás de `prototipoAtivo`; fora dele, `SemTutorial` só repassa os filhos.
- Cada página com tutorial tem `tour.ts` com os tours dela. A ordem entre telas fica em `JORNADA` (`src/shared-domain/tutorial/jornada.ts`).
- Peças de `@/shared-domain/tutorial`: `idDoTour`, `useRegistrarTourDaPagina`, `Tour`, `PassoDoTour`, `JORNADA`.
- Proibido importar `nextstepjs` ou chamar `useNextStep()` em página. A página só declara o tour e o registra.
</regras>

## `tour.ts`

<regras>
- Exporta `tourDaPagina: Tour`. Tela com variantes que mudam a tela inteira exporta um tour por variante (`tourDoPerfilInstitucional`); painel aberto por cima da tela exporta o dele (`tourDoPainelDe<Coisa>`).
- `tour`: id do tour = nome da pasta da página (`'pedidos'`). Variante: `'<pagina>-<variante>'`.
- Cada passo: `title` (frase curta, sem ponto), `content` (uma ou duas frases dizendo o que a pessoa faz ali e por quê), `selector`, `side` (`'bottom'` padrão), `requisitos` (códigos do documento de requisitos que embasam o passo; faixa como `RF139–RF145`).
- `selector`: `` `#${idDoTour('<pagina>', '<elemento>')}` ``. Proibido seletor por classe, por texto ou por estrutura do DS.
- Selector único entre os passos do tour.
- Alvo mais alto que a área visível (tabela inteira, seção com tabela): aponte para uma parte baixa dele (`` `#${idDoTour('pedidos', 'tabela')} thead` `` ou o título da seção).
- Alvo que só existe em certo estado de negócio: o passo não tem `selector` e fecha o tour.
- Proibido declarar `viewportID`, `selectorRetryAttempts`, `selectorRetryDelay`, `showControls` ou `showSkip` no passo: o `TutorialProvider` injeta os padrões.
- Tela da jornada: proibido `nextRoute` no último passo e proibido texto "vamos para a tela X". O passo "A seguir" é gerado a partir de `JORNADA`.
</regras>

## Alvos na tela

<regras>
- Envolva o bloco alvo: `<div id={idDoTour('pedidos', 'filtros')}>…</div>`. O id é global no documento; `idDoTour` evita colisão entre páginas.
- Elemento é o nome do bloco em kebab-case (`cabecalho`, `filtros`, `tabela`, `acoes`, `conta`).
- Não mude o id de um alvo sem mudar o `tour.ts` no mesmo commit.
</regras>

## Registro

<regras>
- A página registra o tour pelo hook fino `use<Pagina>Tour(…)` de `hooks.ts`, chamado no início do componente raiz.
- `useRegistrarTourDaPagina(tourId | undefined)`. `undefined` não registra nada: use enquanto o dado que decide a variante não carregou ou enquanto um drawer modal cobre os alvos.
- Painel aberto por cima da tela registra o tour dele; os registros são uma pilha e o da tela volta ao fechar.
- Todo tour exportado entra em `TOURS_DAS_PAGINAS` de `src/app/routes.tsx`, com import pelo `index.ts` da página.
- Tela que faz parte do fluxo inicial: etapa em `JORNADA` com `tour`, `rota`, `persona`, `nome`, `chamada` e `requisitos`.
</regras>

<exemplo>
```ts
// src/pages/pedidos/hooks.ts
export function usePedidosTour(pedidoAberto: string | null): void {
  useRegistrarTourDaPagina(pedidoAberto === null ? tourDaPagina.tour : undefined);
}
```
</exemplo>

## Teste e verificação

<exemplo>
```ts
// src/pages/pedidos/tour.test.ts
import { describe, expect, it } from 'vitest';
import { tourDaPagina } from './tour';

describe('tourDaPagina (pedidos)', () => {
it('usa o id do tour "pedidos"', () => {
expect(tourDaPagina.tour).toBe('pedidos');
});

it('não repete selector entre os passos', () => {
const selectors = tourDaPagina.steps.map((step) => step.selector);
expect(new Set(selectors).size).toBe(selectors.length);
});

it('todo passo tem selector com o prefixo tour-pedidos- e um título', () => {
for (const step of tourDaPagina.steps) {
expect(step.selector).toMatch(/^#tour-pedidos-/);
expect(step.title).toBeTruthy();
}
});
});

```
</exemplo>

<checklist>
- [ ] `tour.test.ts` verde.
- [ ] Tela na jornada: `src/app/jornada.integracao.test.tsx` verde (falha se o alvo de um passo não existe ou se falta `requisitos`).
- [ ] Conferido no navegador, com o protótipo ligado: troca entre todos os passos, não só o primeiro.
- [ ] Último passo conferido numa janela de cerca de 600px de altura.
- [ ] Aba em primeiro plano durante a conferência (aba oculta não anima).
</checklist>
```
