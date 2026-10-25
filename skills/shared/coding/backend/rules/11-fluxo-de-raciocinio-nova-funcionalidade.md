# Fluxo para implementar uma funcionalidade nova

<regra critica="true">
Responda todas as perguntas da Parte 1, escreva o plano no formato da Parte 2 e apresente-o ao solicitante antes de escrever código. Depois implemente na ordem da Parte 3. Se alguma resposta depender de informação ausente na demanda, pergunte ao solicitante; não assuma.
</regra>

## Parte 1 — Análise da demanda

<perguntas>

| #   | Pergunta                                                                                                                | Consequência                                                                                                                                                                                                                           |
| --- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Qual o objetivo principal da demanda, em uma frase?                                                                     | Define o que está dentro e fora do escopo.                                                                                                                                                                                             |
| 2   | Existe implementação anterior igual ou parecida (memória do agente, módulos e services existentes)?                     | Reutilizar o que existe. Proibido duplicar service, repositório, helper ou validação.                                                                                                                                                  |
| 3   | É funcionamento do sistema (cron, processamento, consumidor de evento), funcionalidade de usuário (endpoint), ou ambos? | Sistema: caso de uso sem controller/DTO (service + module) ou handler de evento. Usuário: caso de uso HTTP completo. Ambos: separar a ação do usuário do processamento.                                                                |
| 4   | Exige integração com serviço externo?                                                                                   | Seguir [`10-integracoes-externas.md`](10-integracoes-externas.md).                                                                                                                                                                     |
| 5   | Exige biblioteca nova?                                                                                                  | Só instalar se a stack atual não resolve e se não duplica capacidade existente. Informar ao solicitante antes de instalar.                                                                                                             |
| 6   | Exige criar tabela, ou adicionar, remover ou alterar coluna, índice ou constraint? Há dado existente a migrar?          | Seguir [`09-banco-de-dados.md`](09-banco-de-dados.md). Remoção ou alteração de coluna exige verificar todo código que a lê ou escreve.                                                                                                 |
| 7   | Envolve dado novo? Quais entidades/tipos criar?                                                                         | Tipos em `models/`, derivados do schema.                                                                                                                                                                                               |
| 8   | Quais módulos de domínio estão envolvidos? Existem ou precisam ser criados?                                             | Substantivo de negócio novo → domínio novo. Ação nova sobre entidade existente → caso de uso no domínio existente.                                                                                                                     |
| 9   | Quais casos de uso estão envolvidos? Existem ou precisam ser criados?                                                   | Listar cada um como `<verbo>-<substantivo>`. Reutilizar service existente via import do módulo.                                                                                                                                        |
| 10  | É necessário alterar código já implementado? Quais arquivos?                                                            | Listar cada arquivo alterado e a mudança de comportamento.                                                                                                                                                                             |
| 11  | Quem consome o que será alterado? A mudança pode causar regressão?                                                      | Mapear com `grep` os consumidores (imports, rotas, tabelas, contratos) e cruzar com a memória de implementações anteriores. Cada consumidor afetado entra no plano com teste que cubra o comportamento.                                |
| 12  | Quais ações o usuário poderá executar no fluxo?                                                                         | Cada ação do usuário = um caso de uso HTTP.                                                                                                                                                                                            |
| 13  | Novos endpoints: quais dados recebem e quais retornam?                                                                  | Definir método, rota, DTO de entrada, shape de resposta e status antes de implementar.                                                                                                                                                 |
| 14  | Cada endpoint é público ou privado? Quais papéis e permissões o acessam? Valida escopo do recurso?                      | `@Publico()` apenas com requisito explícito. Definir a chave de `@ExigirPermissoes`. Recurso de terceiro: também `AccessScopeService.garantirPode` no service. Ver [`08-autenticacao-autorizacao.md`](08-autenticacao-autorizacao.md). |
| 15  | Exige validação nova além do DTO (regra de negócio, unicidade, estado da entidade)?                                     | Validação de formato no DTO; validação de regra no service.                                                                                                                                                                            |
| 16  | Alguma biblioteca envolvida tem trava registrada?                                                                       | Consultar [`12-problemas-conhecidos.md`](12-problemas-conhecidos.md).                                                                                                                                                                  |
| 17  | Há risco de performance?                                                                                                | Verificar a lista abaixo.                                                                                                                                                                                                              |
| 18  | Há risco de segurança?                                                                                                  | Verificar a lista abaixo.                                                                                                                                                                                                              |

</perguntas>

<checklist titulo="Performance">
- [ ] Nenhuma query dentro de loop (N+1); usar `join` ou consulta em lote.
- [ ] Toda listagem é paginada, com `limit` máximo.
- [ ] Colunas usadas em filtro, ordenação e `join` têm índice.
- [ ] Transação contém apenas operações de banco e é curta.
- [ ] Chamada externa tem timeout e circuit breaker e não ocorre dentro de transação.
- [ ] Processamento demorado é assíncrono.
- [ ] Arrays de entrada têm tamanho máximo no DTO.
</checklist>

<checklist titulo="Segurança">
- [ ] Rota protegida por permissão; `@Publico()` apenas com requisito explícito.
- [ ] Recurso de terceiro validado com `AccessScopeService` no service.
- [ ] Toda entrada validada por DTO com `forbidUnknownValues`.
- [ ] Resposta sem campo sensível ou interno.
- [ ] Mutação com `@AcaoAuditoria`.
- [ ] Nenhum dado sensível em log.
- [ ] Chamada externa via `ResilientClient`, com host na allowlist.
- [ ] Segredos e URLs em `env.ts`, nunca no código.
- [ ] Identificador do ator vem de `@Usuario()`, nunca do body.
</checklist>

## Parte 2 — Plano de implementação

<regras>
- Todo plano segue a estrutura abaixo, na ordem, com todas as seções. Seção sem conteúdo recebe "Não se aplica."
- O plano é lido por desenvolvedores que podem implementar manualmente. Escreva por tópicos, em linguagem lógica.
- Proibido código no plano. Descreva o que fazer, não como digitar.
- Fluxo de service é uma lista numerada de passos lógicos. Fluxo existente alterado mostra o passo atual e o novo.
- Cada endpoint tem sua própria subseção.
</regras>

<estrutura>
```markdown
# Plano: <título curto da demanda>

## 1. Objetivo

<uma frase; o que está fora do escopo>

## 2. Contexto

- Implementações anteriores relacionadas (memória do agente, módulos existentes)
- O que será reutilizado

## 3. Banco de dados

- Tabelas novas: nome, colunas, tipos, nulidade, índices, constraints
- Tabelas alteradas: coluna adicionada, removida ou alterada, e o motivo
- Migração de dado existente
- Ou: "Não se aplica."

## 4. Endpoints

### <MÉTODO> <rota>

- Caso de uso: `<verbo>-<substantivo>`, novo ou existente
- Visibilidade: público ou privado
- Papéis: <papéis que podem chamar>
- Permissão: `<chave de @ExigirPermissoes>`
- Escopo do recurso: sim/não; regra de posse aplicada
- DTO de entrada: campo, tipo, obrigatório, validação
- Resposta: status e campos retornados
- Erros: status e condição de cada um

## 5. Validações novas

- Validação, camada (DTO ou service) e erro retornado

## 6. Fluxo lógico do service

### <NomeService> (novo | alterado)

1. <passo lógico>
2. <passo lógico>

- Alteração: passo atual → passo novo

## 7. Artefatos

| Ação            | Tipo                                                                     | Caminho   |
| --------------- | ------------------------------------------------------------------------ | --------- |
| criar / alterar | módulo, controller, service, dto, repositório, model, schema, integração | `src/...` |

## 8. Impacto e regressão

- Consumidores do código alterado e efeito esperado em cada um
- Testes existentes afetados
- Testes novos

## 9. Riscos e dúvidas em aberto

- Perguntas pendentes ao solicitante
- Travas conhecidas aplicáveis (`PC-NNN`)

```
</estrutura>

## Parte 3 — Ordem de implementação

<algoritmo>
```

1. Banco de dados schema/<tabela>.schema.ts, relacoes.ts, index.ts → db:generate → revisar .sql → db:migrate
2. Entidades models/<entidade>.model.ts
3. Módulos repositório + módulo de repositório; <dominio>.module.ts (se domínio novo) + registro em AppModule
4. Casos de uso para cada caso de uso: dto → service → controller → module → registro no módulo do domínio
5. Testes e2e por caso de uso; spec para função pura
6. Verificação format:check, lint, typecheck, test:e2e, build

```
</algoritmo>

<regras>
- Integração externa (contrato, mapeador, registro, mock) é implementada entre os passos 2 e 3.
- Variável de ambiente nova é adicionada a `env.ts` e `.env.example` antes do código que a usa.
- Ordem entre casos de uso: criar → buscar/listar → atualizar → remover/cancelar.
- Caso de uso auxiliar é implementado antes do caso de uso que o consome.
</regras>

## Parte 4 — Conclusão

<checklist>
- [ ] As 18 perguntas foram respondidas.
- [ ] O plano da Parte 2 foi apresentado ao solicitante antes do código.
- [ ] Consumidores do código alterado foram verificados e cobertos por teste.
- [ ] Cada caso de uso tem pasta própria com `handle()` e `execute()` únicos.
- [ ] Regra de negócio apenas em services.
- [ ] Queries apenas em repositórios, com `tx?: Executor`.
- [ ] Nenhum import de arquivo interno de outro domínio.
- [ ] Nenhuma escrita em tabela de outro domínio.
- [ ] Nenhuma abstração ou dependência nova sem necessidade atual.
- [ ] Schema alterado tem migration gerada, revisada e commitada.
- [ ] Nenhum comentário, `console.log`, `any` ou `process.env` fora de `env.ts`.
- [ ] Comandos de verificação executados sem erro.
- [ ] Toda trava investigada durante a tarefa está registrada em [`12-problemas-conhecidos.md`](12-problemas-conhecidos.md), resolvida ou não.
</checklist>
```
