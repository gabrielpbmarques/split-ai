---
trigger: always_on
---

# Guia de Arquitetura Backend - Split AI

Este documento descreve a arquitetura oficial do projeto `split-ai`. Ele serve como fonte da verdade para a equipe de desenvolvimento e para o contexto de IAs auxiliares.

## 1. Visão Geral

O `split-ai` é um backend robusto construído com **NestJS** e **Fastify**, focado em alta performance, modularidade e escalabilidade. O sistema integra múltiplos provedores de IA, comunicação via WhatsApp/SMS e processamento assíncrono.

### Stack Tecnológico

- **Framework**: NestJS v10+
- **HTTP Platform**: Fastify (performance superior ao Express)
- **Linguagem**: TypeScript
- **Runtime**: Node.js / Bun
- **Banco de Dados**:
  - Relacional: PostgreSQL (via TypeORM)
  - Vetorial: Supabase / Vertex AI
  - Cache/Sessão: Redis (Upstash)
- **Infraestrutura**: Google Cloud Platform (Cloud Run, Cloud Storage, Vertex AI)

## 2. Estrutura de Diretórios

A organização segue o princípio de **Feature Slicing** com **Use Case Separation**. Cada funcionalidade específica (Use Case) tem sua própria pasta e conjunto de arquivos.

```
src/
├── main.ts                     # Ponto de entrada (Bootstrap, Fastify Adapter, Hooks)
├── app.module.ts               # Módulo raiz
├── config.ts                   # Configuração Central
│
├── components/                 # Módulos de Domínio (Features)
│   ├── AIChat/                 # Feature Module Principal
│   │   ├── ai-chat.module.ts   # Módulo que importa os sub-módulos
│   │   │
│   │   ├── ListSessions/       # << USE CASE ESPECÍFICO >>
│   │   │   ├── list-sessions.controller.ts  # Controller único para este endpoint
│   │   │   ├── list-sessions.service.ts     # Service único para este caso de uso
│   │   │   ├── list-sessions.dto.ts         # DTOs de entrada e saída
│   │   │   └── list-sessions.module.ts      # Módulo isolado do caso de uso
│   │   │
│   │   └── ValidateUser/       # Outro use case...
│   │
│   ├── Auth/
│   └── components.module.ts    # Agregador de todos os componentes
│
├── repositories/               # Camada de Acesso a Dados
├── infrastructure/             # Integrações Externas
├── entities/                   # Entidades TypeORM
└── observability/              # Logs e Sentry
```

## 3. Padrões Obrigatórios de Código

### 3.1. Camada de Controller (Use Case Controller)

**Regra de Ouro**: Cada endpoint (ou grupo muito coeso) deve ter seu próprio Controller em arquivo separado.

- **Nomenclatura**: `nome-acao.controller.ts`
- **Nome da Classe**: `NomeAcaoController`
- **Método Principal**: O método que responde à rota DEVE se chamar **`handle`**.
- **Segurança**: Obrigatório o uso de `try-catch` para capturar erros e retornar status HTTP corretos.

**Exemplo Obrigatório (`src/components/Conversation/ListSessions/list-sessions.controller.ts`):**

```typescript
@Controller('conversation')
export class ListSessionsController {
  constructor(private readonly listSessionsService: ListSessionsService) {}

  @Get('sessions')
  @UseGuards(AuthGuard)
  @Roles('admin', 'user')
  async handle(
    // << SEMPRE 'handle'
    @Query() dto: ListSessionsDto,
    @User() user: UserEntity,
    @Res() res: FastifyReply,
  ): Promise<FastifyReply> {
    try {
      // Chama o 'execute' do serviço
      const result = await this.listSessionsService.execute(user, dto);
      return res.status(200).send(result);
    } catch (error) {
      // Tratamento de erro explícito
      return res.status(500).send({ error: error.message });
    }
  }
}
```

### 3.2. Camada de Service (Use Case Service)

Contém a regra de negócio do caso de uso específico.

- **Nomenclatura**: `nome-acao.service.ts`
- **Nome da Classe**: `NomeAcaoService`
- **Método Principal**: O ponto de entrada da lógica DEVE se chamar **`execute`**.

**Exemplo Obrigatório (`src/components/Conversation/ListSessions/list-sessions.service.ts`):**

```typescript
@Injectable()
export class ListSessionsService {
  constructor(private sessionRepository: SessionRepository) {}

  async execute(
    // << SEMPRE 'execute'
    user: AuthUser,
    dto: ListSessionsDto,
  ): Promise<SessionsListResponse> {
    // Lógica de negócio isolada
    // Acesso a repositórios
    // Retorno de dados tipados
  }
}
```

### 3.3. Módulos de Feature

O diretório da Feature (ex: `AIChat`) deve ter um módulo principal (`ai-chat.module.ts`) que importa e exporta os módulos dos seus casos de uso (`ListSessionsModule`, etc.).

```typescript
// ai-chat.module.ts
@Module({
  imports: [ListSessionsModule, CreateSessionModule],
  exports: [ListSessionsModule, CreateSessionModule],
})
export class AIChatModule {}
```

### 3.4. Camada de Repository

Abstrai o ORM (TypeORM). Os serviços não devem usar `EntityManager` diretamente, mas sim repositórios tipados.

- Devem ser providers injetáveis e globais ou importados via `RepositoriesModule`.

### 3.5. DTOs

- Uso obrigatório de `class-validator`.
- Devem estar no mesmo arquivo ou pasta do caso de uso.

## 4. Fluxo de Desenvolvimento Padrão

Para criar uma nova funcionalidade (ex: "Excluir Usuário"):

1.  Criar pasta `src/components/User/DeleteUser/`.
2.  Criar `delete-user.dto.ts` com validações.
3.  Criar `delete-user.module.ts` importando TypeOrm e Repositories necessários.
4.  Criar `delete-user.service.ts` com método **`execute()`**.
5.  Criar `delete-user.controller.ts` com método **`handle()`** e bloco `try-catch`.
6.  Importar `DeleteUserModule` em `UserModule`.

## 5. Convenções Gerais

- **Fastify**: Use tipos `FastifyReply` e `FastifyRequest`.
- **Injeção de Dependência**: Sempre via construtor.
- **Config**: Use `src/config.ts`, nunca `process.env`.
