# Acessibilidade

<regra critica="true">
WCAG 2.1 nível AA é critério de pronto: nome acessível em todo controle, foco visível, operação completa por teclado, contraste dos tokens e anúncio do que muda sem ação do foco.

Tela que só funciona com mouse ou que perde o foco depois de uma ação é bug, não melhoria futura.
</regra>

## Estrutura semântica

<regras>
- Um `<main>` por tela, vindo de `Page`. Um `<h1>` por tela, vindo de `PageHeader` ou de `tituloDaPagina`.
- Bloco com título é `Section` (que gera o `<h2>`). Título dentro de drawer ou painel: `<h3>`.
- `<section aria-label="…">` para agrupar partes de um drawer sem título visível próprio.
- Clicável é `<button type="button">` ou componente de botão. Proibido `onClick` em `div` ou `span`.
- Navegação é link (`InternalLink`); ação é botão.
- Lista de itens é `<ul>`/`<li>`; pares rótulo · valor são `ListaDeDados` (`<dl>`).
</regras>

## Nome acessível

<regras>
- Botão só com ícone: `aria-label` no botão; o `Icone` fica decorativo.
- Botão repetido por linha: nome com o alvo (`BotaoDeDetalhes rotuloAcessivel="Detalhes de P-001"`, `BotaoAcao rotuloAcessivel="Remover Ana Souza"`).
- `Search` exige `rotulo`. `Seletor` exige `rotulo`; em barra de filtros, `rotuloOculto` esconde o texto e mantém o nome.
- Campo de formulário tem `label` visível. Mensagem de erro e de ajuda ligadas por `aria-describedby`; campo inválido com `aria-invalid`.
- Selo de estado tem texto; cor nunca é o único meio de informação.
- Ícone que carrega informação sozinho: `<Icone nome="…" rotulo="…" />`.
</regras>

## Teclado e estados de controle

<regras>
- Ação bloqueada continua focável: `aria-disabled="true"` com o motivo em `aria-describedby` (`BotaoAcao` já faz). `disabled` só para controle ocupado durante a escrita.
- Linha clicável da tabela não recebe foco; o caminho de teclado é um botão da própria linha (`renderizarAcoes`).
- Foco, armadilha de foco, `Esc` e retorno do foco de diálogo, drawer, menu e seletor vêm do Radix ou do DS. Proibido reimplementar.
- Foco visível: não remova `outline` nem o anel de foco do DS. Controle novo em `shared/ui` usa `focus-visible:shadow-focus-blue`.
- Dica (`Tooltip`) nunca é o único lugar da informação.
</regras>

## Foco depois de uma ação

<regras>
- Controle que dispara a ação e some (limpar filtros, desativar, reativar): mova o foco para um alvo estável (WCAG 2.4.3). Nunca deixe o foco cair no `body`.
- "Limpar filtros": foco no campo de busca por `ref`.
- Envio de formulário inválido: foco no primeiro campo com erro, depois do render que aplica `aria-invalid` e a mensagem.
- Ação concluída que fecha diálogo e muda a tela: guarde o alvo num estado `focoPendente` com a condição de pronto; aplique quando o diálogo fechou e o dado novo chegou, num `setTimeout(…, 0)` (o Radix devolve o foco ao gatilho num `setTimeout` ao desmontar).
</regras>

<exemplo>
```tsx
// src/pages/pedido/Pedido.tsx
interface FocoPendente {
  alvo: 'acoes' | 'itens';
  pronto: (pedido: DetalhePedido) => boolean;
}

const [focoPendente, setFocoPendente] = useState<FocoPendente | null>(null);
const refDasAcoes = useRef<HTMLDivElement>(null);
const refDosItens = useRef<HTMLDivElement>(null);

useEffect(() => {
if (dialogo !== null || focoPendente === null || !pedido) return;
if (!focoPendente.pronto(pedido)) return;
const temporizador = window.setTimeout(() => {
const recipiente = focoPendente.alvo === 'acoes' ? refDasAcoes.current : refDosItens.current;
recipiente?.querySelector<HTMLButtonElement>('button')?.focus();
setFocoPendente(null);
}, 0);
return () => window.clearTimeout(temporizador);
}, [dialogo, focoPendente, pedido]);

```
</exemplo>

## Anúncios

<regras>
- Erro que aparece depois de uma ação: `FaixaDeAviso anuncio="alert"`. Informação não urgente que muda sozinha: `anuncio="status"`. Faixa fixa da tela: sem `anuncio`.
- Esqueleto de carregamento: `EsqueletoDeTela` com `aria-label` (já tem `role="status"` e `aria-busy`).
- Botão enquanto a escrita corre: `aria-busy={ocupado || undefined}`.
- Mudança de contexto feita pela casca: região `aria-live="polite"` com classe `sr-only`.
- Texto só para leitor de tela: classe `sr-only`.
</regras>

<regra critica="true">
Elemento `sr-only` (ou qualquer `position: absolute`) dentro de um contêiner com `overflow` precisa de um ancestral `relative` dentro desse contêiner. A área de conteúdo do `AppLayout`, a `Table` e o `<form>` de diálogo já são `relative`.

Sem o ancestral, o elemento se posiciona pela página inteira, estica a área que rola e cria rolagem horizontal ou leva o cabeçalho junto no scroll.
</regra>

## Verificação

<checklist>
- [ ] A tela inteira é operável só com `Tab`, `Shift+Tab`, `Enter`, `Espaço` e `Esc`.
- [ ] Todo controle tem nome acessível (testes acham por `getByRole(papel, { name })`).
- [ ] Nenhuma ação deixa o foco no `body`.
- [ ] Erro de formulário e recusa do servidor são anunciados.
- [ ] Nenhuma informação só por cor.
- [ ] Nenhum valor de cor fora dos tokens.
</checklist>
```
