# README.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é este repositório

Conjunto de regras em Markdown para agentes de IA implementarem backends NestJS. Não há código executável, `package.json`, build, lint ou testes. Não é um repositório git.

Os leitores destes arquivos são agentes de IA de qualquer capacidade. O trabalho aqui é editar documentação, não implementar software.

## Estrutura

Os documentos ficam em `rules/`, relativo a este arquivo. Os números abaixo são o prefixo do nome do arquivo.

- `00-visao-geral.md`: índice e stack. Arquivo novo ou renomeado exige atualização do índice.
- `01` a `10`: um tema por arquivo (topologia, convenções, módulos, caso de uso, regras por tipo de arquivo, injeção de dependência, abstrações transversais, autenticação, banco, integrações).
- `11-fluxo-de-raciocinio-nova-funcionalidade.md`: ponto de entrada operacional; referencia os demais.
- `12-problemas-conhecidos.md`: registro contínuo de travas e contornos de bibliotecas. Único arquivo com conteúdo concreto (versões, caminhos, mensagens de erro literais); as entradas seguem o modelo definido no próprio arquivo.

Cada regra tem um único arquivo dono. Os outros arquivos apontam para ele com link inline em vez de repetir a regra:

| Tema                                                    | Arquivo dono |
| ------------------------------------------------------- | ------------ |
| Exemplos completos de caso de uso                       | `04`         |
| Regras de controller, service, DTO, repositório, testes | `05`         |
| Tokens, portas, `ModuloBancoDeDados`                    | `06`         |
| Exceções, `ErrorResponse`, auditoria, logging, health   | `07`         |
| Guards, decorators de autorização, permissões           | `08`         |
| Schema, exclusão lógica, transação, migration           | `09`         |
| Fronteira entre domínios e regra de `join`              | `02`         |
| Travas, contornos e limitações de bibliotecas           | `12`         |

## Formato obrigatório dos documentos

- Antes de criar ou alterar qualquer arquivo desta pasta, leia [`../prompt-creation-practices.md`](../prompt-creation-practices.md). As regras abaixo são a aplicação desse guia a este repositório; em conflito, o guia vence e esta lista é atualizada.
- Português, modo imperativo, frases curtas.
- Somente regras, estruturas, exemplos de código, tabelas e checklists.
- Proibido: justificativa de escolha técnica, alternativas descartadas, histórico, menção a projeto de origem, descrição de como a documentação foi feita, parágrafos de propósito.
- Exceção: `<regra critica="true">` pode terminar com uma frase dizendo o que quebra quando a regra é violada. É consequência, não justificativa de escolha.
- Regra diz o que fazer. Proibição vem acompanhada da ação correta na mesma linha ou na linha seguinte.
- Quando houver duas opções possíveis, escolher uma e escrevê-la como regra.
- Tags XML delimitam blocos: `<papel>`, `<uso>`, `<indice>`, `<stack>`, `<regras>`, `<regra>`, `<regra critica="true">`, `<exemplo>`, `<estrutura>`, `<tabela>`, `<checklist>`, `<checklist titulo="...">`, `<fluxo>`, `<algoritmo>`, `<perguntas>`. Tag nova exige entrada nesta lista.
- Links entre arquivos de `rules/` são relativos à própria pasta e sem âncora (`[`09-banco-de-dados.md`](09-banco-de-dados.md)`).
- Sem bloco de referências cruzadas no fim do arquivo.
- Exemplos de código não contêm comentários explicativos; o único comentário permitido é o caminho do arquivo na primeira linha do bloco.
- Rótulo de exemplo (`Correto:`, `Incorreto:`, `Consumo:`) é uma linha de texto antes do bloco de código, nunca comentário dentro dele.

## Invariantes entre arquivos

Estas decisões aparecem em vários arquivos. Ao alterar uma, procure e ajuste todas as ocorrências:

- Domínio de exemplo: `pedidos` (`CriarPedidoService`, `RepositorioPedidos`, tabela `pedidos`). Permissões de exemplo: `pedido.read`, `pedido.write`.
- Controller expõe apenas `handle()`; service expõe apenas `execute()`.
- Resposta sempre via `@Res() res: FastifyReply`.
- Erros: exceções nativas do Nest. Não existe hierarquia `AppError`.
- DTO HTTP usa `class-validator`; Zod só em `env.ts` e contratos de integração.
- Repositório é classe concreta, recebe `tx?: Executor` por último e nunca abre transação.
- Leitura pode fazer `join` entre domínios (dono = tabela do `FROM`); escrita nunca cruza domínio.
- Colunas de ciclo de vida: `created_at`, `updated_at`, `deleted_at` via `colunasCicloDeVida`; sem `DELETE` físico.
- Nomes: `XxxModule` para caso de uso e domínio; `ModuloXxx` para repositório e banco; `RepositorioXxx` para repositórios.
- Imports absolutos a partir de `src/`.
- Conteúdo específico de provedor de identidade não entra nos documentos.

## Verificação após editar

Executar a partir do diretório deste arquivo:

```bash
grep -rn "<termo-da-regra-alterada>" rules/
grep -rn '\.md#' rules/
grep -rnE '^\s*// ' rules/ | grep -vE '^[^:]+:[0-9]+:\s*// [a-z0-9./-]+\.ts$'
```

O primeiro comando localiza ocorrências da regra alterada nos outros arquivos. O segundo e o terceiro devem retornar vazio.
