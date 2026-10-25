# Fluxo para implementar uma funcionalidade nova

<regra critica="true">
Responda todas as perguntas da Parte 1, escreva o plano no formato da Parte 2 e apresente-o ao solicitante antes de escrever código. Depois implemente na ordem da Parte 3. Se alguma resposta depender de informação ausente na demanda (contrato da API, texto de tela, regra de negócio), pergunte ao solicitante; não assuma.
</regra>

## Parte 1 — Análise da demanda

<perguntas>

| #   | Pergunta                                                                                                                   | Consequência                                                                                                                                           |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Qual o objetivo principal da demanda, em uma frase?                                                                        | Define o que está dentro e fora do escopo.                                                                                                             |
| 2   | Existe implementação igual ou parecida (outra página, `shared-domain/`, `shared/ui/`, `shared/hooks/`, memória do agente)? | Reutilizar. Proibido duplicar componente, hook, rótulo, filtro ou conversão. Segunda página que precisa de algo de outra: mover para `shared-domain/`. |
| 3   | É tela nova, mudança em tela existente, ou mudança transversal (casca, `shared/ui/`, cliente HTTP)?                        | Tela nova: [`03-anatomia-da-pagina.md`](03-anatomia-da-pagina.md). Transversal: listar todas as telas afetadas.                                        |
| 4   | A tela roda no protótipo, com a API real ou nos dois?                                                                      | Define `modo` do destino e se há rota simulada. Ver [`10-prototipo-e-simulacao.md`](10-prototipo-e-simulacao.md).                                      |
| 5   | Quais endpoints a tela consome? Método, caminho, corpo, resposta, códigos de erro. Existem na API?                         | Contratos em `shared/contracts/`. Campo ou rota inexistente na API: extensão com `DECISAO-PENDENTE`.                                                   |
| 6   | Algum contrato compartilhado com outro repositório muda?                                                                   | Avisar o solicitante; a mudança precisa acontecer nos dois lados.                                                                                      |
| 7   | Quem acessa a tela? Qual permissão guarda a rota? Permissão nova?                                                          | Entrada em `PERMISSOES` e `permissao` do destino. Ver [`09-autenticacao-e-permissoes.md`](09-autenticacao-e-permissoes.md).                            |
| 8   | Quais ações a pessoa executa? Cada uma vem em `acoes`/`bloqueios` do recurso?                                              | Ação de recurso: `BotaoAcao`. Ação sem recurso: `temPermissao`.                                                                                        |
| 9   | Cada ação pede confirmação, justificativa ou formulário?                                                                   | `ConfirmacaoDialog`, `DialogoDeAcao` ou formulário em `Dialog`. Ver [`07-formularios-e-acoes.md`](07-formularios-e-acoes.md).                          |
| 10  | O que cada escrita muda na tela e em outras telas?                                                                         | Invalidação: `atualizarConsultasDepoisDaEscrita`, `setQueryData`, raiz da chave no modo real.                                                          |
| 11  | Que estado sobrevive a recarga ou link (filtro, aba, item aberto, passo)?                                                  | Vai na URL. Ver [`06-padroes-de-tela.md`](06-padroes-de-tela.md).                                                                                      |
| 12  | Detalhe em rota própria ou em drawer?                                                                                      | Pasta própria + sub-rota, ou `DetalheDrawer` com `?<recurso>=`.                                                                                        |
| 13  | Quais componentes de `@/shared/ui` atendem? Falta algum?                                                                   | Composição ou ponte. Ver [`05-design-system-e-estilo.md`](05-design-system-e-estilo.md).                                                               |
| 14  | Exige biblioteca nova?                                                                                                     | Só se a stack não resolve e não duplica capacidade. Informar ao solicitante antes de instalar.                                                         |
| 15  | Quais os textos dos estados: carregando, erro, vazio, vazio com filtro, 404, bloqueios?                                    | Textos definidos no plano, em português.                                                                                                               |
| 16  | Para onde vai o foco depois de cada ação? O que é anunciado?                                                               | Ver [`08-acessibilidade.md`](08-acessibilidade.md).                                                                                                    |
| 17  | A tela tem tutorial? Entra na jornada do fluxo inicial?                                                                    | `tour.ts`, alvos, `JORNADA`. Ver [`11-tutorial-guiado.md`](11-tutorial-guiado.md).                                                                     |
| 18  | Quem consome o que será alterado? A mudança pode causar regressão?                                                         | Mapear com `grep` imports, chaves de consulta, ids de tour, rotas e contratos. Cada consumidor afetado entra no plano com teste.                       |
| 19  | Há escolha de comportamento sem decisão do dono do produto?                                                                | Opção mais simples coerente com os requisitos, marcador `DECISAO-PENDENTE` e registro.                                                                 |
| 20  | Alguma biblioteca envolvida tem trava registrada?                                                                          | Consultar [`14-problemas-conhecidos.md`](14-problemas-conhecidos.md).                                                                                  |
| 21  | Há risco de performance?                                                                                                   | Verificar a lista abaixo.                                                                                                                              |
| 22  | Há risco de segurança?                                                                                                     | Verificar a lista abaixo.                                                                                                                              |

</perguntas>

<checklist titulo="Performance">
- [ ] Nenhuma requisição por linha de lista; dado da linha vem do endpoint da lista.
- [ ] Consulta de painel, catálogo ou candidatos só dispara ao abrir (`enabled: ativo && …`).
- [ ] Lista longa paginada (`tamanhoDaPagina: 20`) ou agrupada.
- [ ] Filtro e ordenação no cliente com `useMemo` sobre os parâmetros primitivos.
- [ ] Busca enviada ao servidor com `keepPreviousData`.
- [ ] Código exclusivo do protótipo atrás de `lazy`/`import()` com `prototipoAtivo`.
- [ ] Dependência pesada nova em chunk próprio (`manualChunks` de `vite.config.ts`).
</checklist>

<checklist titulo="Segurança">
- [ ] Token só via `useAccessToken`; nada gravado em storage.
- [ ] Nenhum segredo em `VITE_*`; nenhuma URL ou chave fixa no código fora de `environment.ts`.
- [ ] Proibido `dangerouslySetInnerHTML`, `eval` e `new Function`.
- [ ] Texto vindo da API renderizado como texto (JSX), nunca como HTML.
- [ ] Link externo com `InternalLink type="external"` (`target="_blank"` com `rel` seguro).
- [ ] Permissão e ação decididas pelo servidor; a tela só reflete.
- [ ] Nenhum dado pessoal ou token em `console.error`.
- [ ] Simulação fora do build de qa, uat e produção.
</checklist>

## Parte 2 — Plano de implementação

<regras>
- Todo plano segue a estrutura abaixo, na ordem, com todas as seções. Seção sem conteúdo recebe "Não se aplica."
- O plano é lido por desenvolvedores que podem implementar manualmente. Escreva por tópicos, em linguagem lógica.
- Proibido código no plano. Descreva o que fazer, não como digitar.
- Fluxo de ação é uma lista numerada de passos lógicos. Fluxo existente alterado mostra o passo atual e o novo.
- Cada tela tem sua própria subseção.
</regras>

<estrutura>
```markdown
# Plano: <título curto da demanda>

## 1. Objetivo

<uma frase; o que está fora do escopo>

## 2. Contexto

- Implementações relacionadas (páginas, shared-domain, memória do agente)
- O que será reutilizado

## 3. Contratos e endpoints

### <MÉTODO> <caminho>

- Contrato: tipo de request e de response em `shared/contracts/<assunto>.ts`
- Existe na API: sim/não (extensão → DECISAO-PENDENTE)
- Erros esperados: status, código e o que a tela faz

## 4. Telas

### <Título da tela> (`src/pages/<pagina>/`, nova | alterada)

- Destino: id, rota, permissão, modo, menu/início
- Estado na URL: parâmetros e valores aceitos
- Componentes: novos, reutilizados de `@/shared/ui` e de `shared-domain/`
- Estados: textos de carregando, erro, vazio, vazio com filtro, 404
- Ações: botão, origem da habilitação (`acoes` ou `temPermissao`), confirmação/justificativa/formulário

## 5. Fluxo de cada ação

### <Ação>

1. <passo lógico>
2. <passo lógico>

- Sucesso: aviso, o que é relido, para onde vai o foco
- Recusa: onde aparece a mensagem
- Alteração: passo atual → passo novo

## 6. Simulação

- Rotas simuladas novas ou alteradas
- Seed alterado e nova `VERSAO_DOS_DADOS`
- Ou: "Não se aplica."

## 7. Tutorial

- Tour novo ou alterado, alvos, posição na jornada
- Ou: "Não se aplica."

## 8. Artefatos

| Ação            | Tipo                                                                                                        | Caminho   |
| --------------- | ----------------------------------------------------------------------------------------------------------- | --------- |
| criar / alterar | contrato, api, hooks, componente, página, destino, permissão, rota, ícone, rota simulada, seed, tour, teste | `src/...` |

## 9. Impacto e regressão

- Consumidores do código alterado e efeito esperado em cada um
- Testes existentes afetados
- Testes novos

## 10. Riscos e dúvidas em aberto

- Perguntas pendentes ao solicitante
- Decisões pendentes (`DECISAO-PENDENTE: <id>`)
- Travas conhecidas aplicáveis (`PC-NNN`)

```
</estrutura>

## Parte 3 — Ordem de implementação

<algoritmo>
```

1. Contratos shared/contracts/<assunto>.ts + index.ts
2. Simulação dados/ (seed) → VERSAO_DOS_DADOS + retrato → <assunto>.ts → rotas/<recurso>.ts → ROTAS_SIMULADAS
3. Acesso PERMISSOES → DESTINOS → ícone em ICONES
4. Página types.ts → api.ts → hooks.ts → components/ → <Pagina>.tsx → index.ts
5. Registro TELAS_JA_DISPONIVEIS em routes.tsx
6. Tutorial ids nos alvos → tour.ts → TOURS_DAS_PAGINAS → JORNADA (se aplicável)
7. Testes hooks.test.ts / api.test.ts → <Pagina>.test.tsx → tour.test.ts → integração
8. Verificação format, lint, typecheck, test, build

```
</algoritmo>

<regras>
- Tela só com a API real pula o passo 2.
- Variável de ambiente nova entra antes do código que a usa. Ver [`01-topologia.md`](01-topologia.md).
- Componente novo em `shared/ui/` (com teste) é implementado antes da página que o consome.
- Movimento para `shared-domain/` acontece antes de a segunda página consumir.
- Ordem entre telas: lista → detalhe → criação → edição → ações de estado.
</regras>

## Parte 4 — Conclusão

<checklist>
- [ ] As 22 perguntas foram respondidas.
- [ ] O plano da Parte 2 foi apresentado ao solicitante antes do código.
- [ ] Consumidores do código alterado foram verificados e cobertos por teste.
- [ ] Página na forma de [`03-anatomia-da-pagina.md`](03-anatomia-da-pagina.md), sem arquivo vazio.
- [ ] Nenhum import de outra página; DS, Radix e Font Awesome só via `@/shared/ui`.
- [ ] Toda requisição via `useApi` + `api.ts`; toda consulta com a chave do contexto e o `enabled`.
- [ ] Toda escrita relê as consultas; recusa mostrada com `mensagemDaEscrita`.
- [ ] Ação de recurso por `BotaoAcao`.
- [ ] Estados de carregamento, erro e vazio tratados.
- [ ] Foco e nomes acessíveis verificados.
- [ ] Nenhum valor visual literal; só tokens.
- [ ] Nenhum `console.log`, `any`, `eslint-disable`, `export default` ou `import.meta.env` fora de `environment.ts`.
- [ ] Seed alterado com `VERSAO_DOS_DADOS` e retrato atualizados.
- [ ] Decisões pendentes marcadas e registradas.
- [ ] Comandos de verificação executados sem erro.
- [ ] Toda trava investigada durante a tarefa está registrada em [`14-problemas-conhecidos.md`](14-problemas-conhecidos.md), resolvida ou não.
</checklist>
```
