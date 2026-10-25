# README.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é este repositório

Conjunto de regras em Markdown para agentes de IA implementarem frontends React (SPA com Vite). Não há código executável, `package.json`, build, lint ou testes. Não é um repositório git.

Os leitores destes arquivos são agentes de IA de qualquer capacidade. O trabalho aqui é editar documentação, não implementar software.

## Estrutura

Os documentos ficam em `rules/`, relativo a este arquivo. Os números abaixo são o prefixo do nome do arquivo.

- `00-visao-geral.md`: índice e stack. Arquivo novo ou renomeado exige atualização do índice.
- `01` a `12`: um tema por arquivo (topologia, convenções, página, dados do servidor, design system, padrões de tela, formulários e ações, acessibilidade, autenticação e permissões, protótipo, tutorial, testes).
- `13-fluxo-de-raciocinio-nova-funcionalidade.md`: ponto de entrada operacional; referencia os demais.
- `14-problemas-conhecidos.md`: registro contínuo de travas e contornos de bibliotecas. Único arquivo com conteúdo concreto (versões, caminhos, mensagens de erro literais); as entradas seguem o modelo definido no próprio arquivo.

Cada regra tem um único arquivo dono. Os outros arquivos apontam para ele com link inline em vez de repetir a regra:

| Tema                                                                            | Arquivo dono |
| ------------------------------------------------------------------------------- | ------------ |
| Pastas, `main.tsx`, providers, ambiente, ferramentas, verificação               | `01`         |
| Fronteiras de import, idioma, nomenclatura, comentários, tipagem                | `02`         |
| Exemplo completo de página e receita de criação                                 | `03`         |
| Cliente HTTP, contratos, consultas, chaves, escritas, invalidação, erros de API | `04`         |
| Import do DS, camada `shared/ui`, pontes, ícones, estilo e tokens               | `05`         |
| `Page`, estados de carregamento/erro/vazio, lista, filtros, tabela, detalhe     | `06`         |
| Formulário, validação, ação do servidor, confirmação, justificativa, aviso      | `07`         |
| Foco, nome acessível, anúncio, contêiner posicionado                            | `08`         |
| Sessão, token, `/me`, contexto, permissões, destinos, rotas protegidas          | `09`         |
| Flags de ambiente, servidor simulado, `DECISAO-PENDENTE`                        | `10`         |
| `tour.ts`, `idDoTour`, registro de tour, jornada                                | `11`         |
| Helpers de teste, transporte, mocks de ambiente                                 | `12`         |
| Travas, contornos e limitações de bibliotecas                                   | `14`         |

## Formato obrigatório dos documentos

- Antes de criar ou alterar qualquer arquivo desta pasta, leia [`../prompt-creation-practices.md`](../prompt-creation-practices.md). As regras abaixo são a aplicação desse guia a este repositório; em conflito, o guia vence e esta lista é atualizada.
- Português, modo imperativo, frases curtas.
- Somente regras, estruturas, exemplos de código, tabelas e checklists.
- Proibido: justificativa de escolha técnica, alternativas descartadas, histórico, menção a projeto de origem, descrição de como a documentação foi feita, parágrafos de propósito.
- Exceção: `<regra critica="true">` pode terminar com uma frase dizendo o que quebra quando a regra é violada. É consequência, não justificativa de escolha.
- Regra diz o que fazer. Proibição vem acompanhada da ação correta na mesma linha ou na linha seguinte.
- Quando houver duas opções possíveis, escolher uma e escrevê-la como regra.
- Tags XML delimitam blocos: `<papel>`, `<uso>`, `<indice>`, `<stack>`, `<regras>`, `<regra>`, `<regra critica="true">`, `<exemplo>`, `<estrutura>`, `<tabela>`, `<checklist>`, `<checklist titulo="...">`, `<fluxo>`, `<algoritmo>`, `<perguntas>`. Tag nova exige entrada nesta lista.
- Links entre arquivos de `rules/` são relativos à própria pasta e sem âncora (`[`04-dados-do-servidor.md`](04-dados-do-servidor.md)`).
- Sem bloco de referências cruzadas no fim do arquivo.
- Exemplos de código não contêm comentários explicativos; o único comentário permitido é o caminho do arquivo na primeira linha do bloco. Exceção: o marcador `// DECISAO-PENDENTE: <id>` quando o exemplo ensina o próprio marcador.
- Rótulo de exemplo (`Correto:`, `Incorreto:`, `Consumo:`) é uma linha de texto antes do bloco de código, nunca comentário dentro dele.

## Invariantes entre arquivos

Estas decisões aparecem em vários arquivos. Ao alterar uma, procure e ajuste todas as ocorrências:

- Domínio de exemplo: `pedidos`. Página `src/pages/pedidos/`, componente `Pedidos`, rota `/pedidos`, detalhe em `?pedido=<id>`, contratos `PedidoDaLista` e `DetalhePedido`, chave `CHAVE_DOS_PEDIDOS = 'pedidos'`, permissões `PERMISSOES.verPedidos` (`PEDIDOS.PEDIDO.VER`), `PERMISSOES.aprovarPedidos` (`PEDIDOS.PEDIDO.APROVAR`) e `PERMISSOES.exportarPedidos` (`PEDIDOS.PEDIDO.EXPORTAR`), ações do servidor `aprovar` e `cancelar`.
- Página tem só `types.ts`, `api.ts`, `hooks.ts`, `components/`, `<Pagina>.tsx`, `tour.ts`, `index.ts` e testes; arquivo sem conteúdo real não existe.
- `@pucpr-ds/react` e Radix só dentro de `src/shared/ui/`; Font Awesome só em `src/shared/ui/Icone.tsx`.
- Toda requisição passa por `useApi()` e por uma função de `api.ts`.
- Toda consulta termina a chave com `...useChaveDoContexto()` e declara `enabled: !prototipoAtivo || chave[0] !== null`.
- Toda escrita chama `atualizarConsultasDepoisDaEscrita(queryClient)` no `onSuccess`.
- Mensagem de escrita recusada sai de `mensagemDaEscrita(erro, generica)`; `null` significa que a casca já avisou.
- Ação sobre recurso é `BotaoAcao` com `acoes` e `bloqueios` do servidor.
- Fora da própria pasta, import com `@/`; dentro, import relativo.
- Identificadores e textos em português; exceções listadas em `02`.
- Componente é `export function`, sem `export default`; renderização condicional é `cond ? <X /> : null`.

## Verificação após editar

Executar a partir do diretório deste arquivo:

```bash
grep -rn "<termo-da-regra-alterada>" rules/
grep -rn '\.md#' rules/
grep -rnE '^\s*// ' rules/ | grep -vE '^[^:]+:[0-9]+:\s*// ([a-zA-Z0-9@./-]+\.(ts|tsx|css|mjs)|DECISAO-PENDENTE: [a-z0-9-]+)$'
```

O primeiro comando localiza ocorrências da regra alterada nos outros arquivos. O segundo e o terceiro devem retornar vazio.
