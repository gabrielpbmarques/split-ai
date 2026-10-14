# PROTOCOLO DE AUTO-EVOLUÇÃO CONTÍNUA (EVOLUTION.md)

Este protocolo define como o agente deve analisar interações, identificar lacunas operacionais, registrar aprendizados e refinar artefatos em `/memories/` e `/skills/` de maneira atômica e eficiente.

---

## 1. Triggers de Aprendizado

O agente deve ativar a rotina de reflexão e evolução sempre que ocorrer um dos seguintes eventos:

- **Correção explícita do usuário:** O usuário corrige um dado factual, lógica de raciocínio, premissa de negócio ou preferência de formatação.
- **Falha de ferramenta ou recuperação de erro:** Uma tool falhou, retornou schema inesperado ou exigiu múltiplas tentativas de retry até a resolução.
- **Descoberta de padrão repetitivo:** Uma sequência de ações foi solicitada ou executada com padrão similar mais de duas vezes.
- **Ambivalência resolvida:** Uma dúvida ou ambiguidade foi esclarecida pelo usuário e passa a ser uma premissa estabelecida.

---

## 2. Taxonomia de Atualização (Onde registrar cada aprendizado)

| Tipo de Aprendizado                           | Destino no VFS                                                                             | Regra de Escrita                                       |
| :-------------------------------------------- | :----------------------------------------------------------------------------------------- | :----------------------------------------------------- |
| **Preferência / Fato novo do usuário**        | `/memories/sherlock/USER_PROFILE.md`                                                       | Incremental, formato bullet point com data ou contexto |
| **Premissa conceitual / Regra de negócio**    | `/memories/sherlock/WORLDVIEW.md` ou `/memories/sherlock/doctrines/`                       | Ajuste atômico no tópico correspondente                |
| **Procedimento técnico recorrente**           | `/skills/sherlock/<nome-da-tarefa>/SKILL.md` ou `/skills/shared/<nome-da-tarefa>/SKILL.md` | Criar pasta com `SKILL.md` e frontmatter YAML          |
| **Heurística de depuração / Lições de erros** | `/memories/sherlock/PLAYBOOK_ERRORS.md`                                                    | Estrutura: Sintoma -> Causa Raiz -> Mitigação          |
| **Raciocínio intermediário da sessão**        | `/scratchpad/notes.md`                                                                     | Efêmero (descartado ou limpo pós-sessão)               |

---

## 3. Protocolo de Cristalização de Skills

Quando uma sequência operacional complexa for validada com sucesso, transforme-a em uma skill para eliminar custo de raciocínio futuro:

1. **Condição de criação:** A rotina exigiu mais de 3 passos encadeados e tem probabilidade de reuso.
2. **Localização:** Crie `/skills/sherlock/<nome-da-tarefa>/SKILL.md` (específica deste agente) ou `/skills/shared/<nome-da-tarefa>/SKILL.md` (se de utilidade geral). O arquivo deve obrigatoriamente se chamar `SKILL.md` dentro de sua respectiva pasta.
3. **Formato obrigatório da Skill (padrão Agent Skills com frontmatter YAML):**

   ```markdown
   ---
   name: [nome_da_skill_em_kebab_case]
   description:
     [Descrição concisa em 1-2 linhas sobre o objetivo e quando usar esta skill]
   ---

   # Skill: [Nome da Ação]

   - **Objetivo:** [Resultado esperado em 1 linha]
   - **Pré-condições:** [Inputs necessários / ferramentas exigidas]
   - **Passo a Passo:**
     1. [Instrução direta]
     2. [Instrução direta]
   - **Tratamento de Exceções:** [O que fazer se a ferramenta X falhar]
   - **Critério de Sucesso:** [Como validar o retorno]
   ```
