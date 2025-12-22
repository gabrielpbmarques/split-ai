---
trigger: always_on
---

# Padrões de Código e Arquitetura - Split AI

Este documento apresenta uma análise detalhada dos padrões de código, arquitetura e princípios de desenvolvimento adotados no projeto `split-ai`. A análise baseia-se na investigação dos componentes de chat de IA e estrutura geral do backend.

## 1. Filosofia Arquitetural: Feature Slicing com Casos de Uso

O projeto foge de arquiteturas monolíticas tradicionais (Model-View-Controller aglomerados) e adota uma abordagem moderna focada em **Feature Modules** e **Use Case Separation**.

### O Padrão "Component-per-Action"

A característica mais marcante é a granularidade dos serviços e controllers. Em vez de um `UserController` gigante com 20 métodos, temos diretórios específicos para cada ação.

**Estrutura Típica:**

```text
src/components/AIChat/              <-- Feature Module
├── Question/                       <-- Use Case (Pasta da Ação)
│   ├── question.controller.ts      <-- Controller ÚNICO para esta ação
│   ├── question.service.ts         <-- Service ÚNICO com a lógica
│   ├── question.dto.ts             <-- DTOs de entrada específicos
│   └── question.module.ts          <-- Módulo isolado
```

**Benefícios Observados:**

- **Baixo Acoplamento:** Mudar a lógica de "Enviar Pergunta" não afeta "Listar Histórico".
- **Cognitive Load Reduzido:** O desenvolvedor abre a pasta `Question` e vê _tudo_ e _apenas_ o que é pertinente àquela funcionalidade.
- **Fácil Testabilidade:** Services pequenos com uma única responsabilidade são triviais de mockar e testar.

---

## 2. Padrões de Codificação (Clean Code & KISS)

### 2.1. O Padrão `execute()` (Command Pattern)

Todos os Services e muitos Controllers seguem estritamente uma convenção de nomenclatura única para seu método principal.

- **Controllers:** Método `handle()` ou `execute()`.
- **Services:** Método `execute()`.

**Exemplo (`QuestionService`):**

```typescript
@Injectable()
export class QuestionService {
  async execute(dto: QuestionDto, user: UserEntity, ...): Promise<void> {
    // 1. Validações
    // 2. Orquestração de chamadas
    // 3. Retorno
  }
}
```

Isso simplifica a leitura, pois você não precisa adivinhar se o método se chama `createQuestion`, `processQuestion` ou `run`. É sempre `execute`.

### 2.2. Services como Orquestradores (Orchestrator Pattern)

Os Services de caso de uso (como `QuestionService`) atuam principalmente como **maestros**, regendo outros serviços especializados, em vez de conter toda a lógica bruta.

**Fluxo observado no `QuestionService`:**

1.  Verifica créditos (`ConsumeCreditsService`)
2.  Resolve o agente (`ResolveAgentService`)
3.  Busca sessão (`CreateSessionService`)
4.  Grava mensagem do usuário (`RecordChatMessageService`)
5.  Gera resposta da IA (`GenerateAiResponseService`)

Isso mantém o código extremamente limpo (**Clean Code**) e segue o princípio de Responsabilidade Única (SRP), onde cada sub-serviço faz apenas uma coisa bem feita.

### 2.3. Simplicidade (KISS) e Tipagem Forte

O código evita abstrações desnecessárias.

- **DTOs Explícitos:** Uso de `class-validator` para garantir que os dados cheguem limpos.
- **Sem Classes Base Genéricas:** Não há heranças complexas (`BaseController`, `BaseService`) que escondem comportamento. O código é explícito.
- **Tratamento de Stream Manual:** No `QuestionController`, o stream HTTP é manipulado diretamente via `res.raw.write`. Embora baixo nível, é a solução mais simples e performática para o problema específico (Server-Sent Events/Chunked Response), evitando bibliotecas de terceiros inchadas.

---

## 3. Segurança e Robustez

### 3.1. Guards e Decorators

A autenticação e extração de usuário são feitas de forma declarativa e limpa.

```typescript
@Post('question')
@UseGuards(AuthGuard) // Blindagem da rota
async execute(
  @Res() res: FastifyReply,
  @Body() dto: QuestionDto,
  @AuthUser() user: UserEntity, // Injeção limpa do usuário logado
)
```

### 3.2. Tratamento de Erros

O uso de `try-catch` é pontual e estratégico. No streaming, por exemplo, o erro é capturado e enviado como parte do chunk de dados para o frontend saber que houve falha no meio da transmissão, garantindo UX melhor do que um simples "crash" de conexão.

---

## 4. Tecnologias e Stack

- **NestJS**: Framework base para Injeção de Dependência e Modularidade.
- **Fastify**: Usado como plataforma HTTP subjacente (revela foco em alta performance, já que Fastify é consideravelmente mais rápido que Express).
- **LangChain**: Integrado nos serviços de IA (`GenerateAiResponseService`), mas abstraído atrás de services do domínio.

## 5. Resumo para Desenvolvedores

Ao criar uma nova funcionalidade no `split-ai`:

1.  **Crie uma Pasta**: Não adicione métodos a controllers existentes. Crie uma nova pasta em `src/components/Module/Action`.
2.  **Siga o Padrão**: Crie `FileController`, `FileService`, `FileDto`.
3.  **Nomeie como `execute`**: O método principal do seu serviço deve ser `execute`.
4.  **Orquestre**: Se a lógica ficar grande, quebre em sub-serviços reutilizáveis (ex: `VerifyPermissionsService`) e injete-os.
5.  **Valide**: Sempre use DTOs com decorators de validação.

Este padrão garante que o projeto escale para centenas de endpoints sem se tornar um espaguete de código difícil de manter.
