# Documentação da Arquitetura - Split-AI

## 📋 O que é o projeto

Split-AI é uma plataforma robusta de assistentes virtuais baseados em inteligência artificial, desenvolvida com NestJS. O sistema oferece:

- **Chat com IA**: Conversas em tempo real com streaming de respostas
- **Múltiplos Agentes**: Suporte para criação e gerenciamento de agentes personalizados
- **RAG (Retrieval-Augmented Generation)**: Busca vetorial e contexto enriquecido
- **Multi-tenancy**: Isolamento por organizações
- **Integração WhatsApp**: Sistema completo de atendimento via WhatsApp
- **Analytics e Relatórios**: Dashboard com métricas e análises
- **Gestão de Conhecimento**: Upload de PDFs e sites para base de conhecimento

## 🚀 Tecnologias Usadas

### Framework Principal

- **NestJS 10.x** - Framework Node.js para aplicações escaláveis
- **Fastify** - Servidor HTTP de alta performance (substituindo Express)
- **TypeScript** - Tipagem estática e melhor DX
- **Bun** - Runtime JavaScript/TypeScript e gerenciador de pacotes

### Bancos de Dados

- **PostgreSQL** - Banco relacional principal (via TypeORM)
- **MongoDB** - Dados não-relacionais (via Mongoose)
- **Redis** (Upstash) - Cache e gerenciamento de sessões
- **Supabase** - Vector Store para busca semântica

### Inteligência Artificial

- **LangChain** - Orquestração de IA e pipelines
- **Google Vertex AI** - Modelos de IA (Gemini) e embeddings
- **OpenAI** - Provedor alternativo de IA
- **Google Cloud Vision** - OCR e processamento de imagens
- **Google Text-to-Speech** - Síntese de voz

### Infraestrutura e Serviços

- **Google Cloud Storage** - Armazenamento de arquivos
- **SendGrid** - Envio de emails transacionais
- **Twilio** - SMS e WhatsApp
- **Sentry** - Monitoramento de erros em produção
- **Docker** - Containerização
- **JWT** - Autenticação baseada em tokens

### Qualidade de Código

- **ESLint** - Linting de código
- **Prettier** - Formatação automática
- **Husky** - Git hooks
- **Jest** - Framework de testes
- **Commitlint** - Padronização de commits

## 🏗️ Padrão de Arquitetura

O projeto segue uma **arquitetura modular em camadas** com clara separação de responsabilidades:

```
src/
├── main.ts                    # Bootstrap da aplicação
├── app.module.ts              # Módulo raiz
├── config.ts                  # Configurações centralizadas
│
├── components/                # Módulos de negócio (feature modules)
│   ├── AIChat/               # Chat com IA
│   ├── ArtificialIntelligence/ # Core de IA
│   ├── Auth/                 # Autenticação
│   ├── Dashboard/            # Analytics
│   ├── Organization/         # Multi-tenancy
│   ├── Report/               # Relatórios
│   ├── Session/              # Sessões
│   ├── Source/               # Gestão de fontes
│   ├── User/                 # Usuários
│   └── Whatsapp/             # Integração WhatsApp
│
├── repositories/              # Camada de acesso a dados
│   ├── repositories.module.ts
│   └── *.repository.ts
│
├── entities/                  # Entidades TypeORM
│   └── *.entity.ts
│
├── infrastructure/            # Provedores externos
│   ├── providers/
│   └── infrastructure.module.ts
│
├── auth/                      # Guards e estratégias
├── decorators/                # Decorators customizados
├── types/                     # TypeScript types/interfaces
└── utils/                     # Utilitários
```

### Princípios Arquiteturais

1. **Modularidade**: Cada funcionalidade em seu próprio módulo
2. **Responsabilidade Única**: Cada classe/arquivo com propósito específico
3. **Dependency Injection**: Uso extensivo do DI do NestJS
4. **Separation of Concerns**: Controllers → Services → Repositories
5. **Domain-Driven Design**: Organização por domínio/funcionalidade

## 🎮 Padrão de Código dos Controllers

### Estrutura Padrão

```typescript
@Controller('route-prefix')
export class ComponentController {
  constructor(private readonly componentService: ComponentService) {}

  @Post('action')
  @UseGuards(AuthGuard)
  @Roles('admin', 'user')
  async handle(
    @Body() dto: ComponentDto,
    @Res() res: FastifyReply,
    @AuthUser() user: User,
  ): Promise<FastifyReply> {
    try {
      const result = await this.componentService.execute(dto, user);
      return res.status(201).send(result);
    } catch (error) {
      return res.status(error.status || 500).send(error.message);
    }
  }
}
```

### Características dos Controllers

- **Fastify Reply**: Sempre usa `FastifyReply` ao invés de Express Response
- **Decorators de Segurança**:
  - `@UseGuards(AuthGuard)` para autenticação
  - `@Roles('admin', 'user')` para autorização
  - `@Public()` para rotas públicas
- **Injeção de Usuário**: `@AuthUser()` decorator para obter usuário autenticado
- **Tratamento de Erros**: Try-catch consistente com status HTTP apropriados
- **Validação Automática**: Via DTOs com ValidationPipe
- **Nomenclatura**:
  - Métodos: `handle()`
  - Arquivos: `kebab-case` (ex: `login.controller.ts`)
  - Classes: `PascalCase` (ex: `LoginController`)

## 🛠️ Padrão de Código dos Services

### Estrutura Padrão

```typescript
@Injectable()
export class ComponentService {
  constructor(
    private readonly repository: ComponentRepository,
    private readonly otherService: OtherService,
  ) {}

  async execute(dto: ComponentDto, user?: User) {
    // Validação de regras de negócio
    // Processamento de dados
    // Chamadas para repositórios
    // Integração com outros services
    // Retorno estruturado
  }
}
```

### Características dos Services

- **Método Principal**: Sempre `execute()` como ponto de entrada
- **Dependency Injection**: Injeção via constructor
- **Lógica de Negócio**: Toda regra de negócio centralizada no service
- **Transações**: Gerenciamento de transações quando necessário
- **Error Handling**: Lançamento de exceções específicas do NestJS:
  - `UnauthorizedException`
  - `BadRequestException`
  - `ForbiddenException`
  - `NotFoundException`
- **Async/Await**: Uso consistente de operações assíncronas
- **Validações**: Regras de negócio validadas antes de persistir

### Exemplo Real

```typescript
@Injectable()
export class LoginService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly generateTokenService: GenerateTokenService,
  ) {}

  async execute(loginDto: LoginDto) {
    const user = await this.userRepository.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Validação de senha com bcrypt
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password_hash,
    );

    // Geração de token JWT
    const { token, expiresAt } = await this.generateTokenService.execute(user);

    return { user: {...}, token, expiresAt };
  }
}
```

## 📝 Padrão dos DTOs

### Estrutura Padrão

```typescript
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class ComponentDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean = true;
}
```

### Características dos DTOs

- **Class Validator**: Uso extensivo de decorators de validação
- **Tipagem Forte**: Todos os campos com tipos TypeScript
- **Campos Opcionais**: Uso de `?` e `@IsOptional()`
- **Valores Default**: Definição de valores padrão quando apropriado
- **Validações Compostas**:
  - Email: `@IsEmail()`
  - Strings: `@IsString()`, `@MinLength()`, `@MaxLength()`
  - Números: `@IsNumber()`, `@Min()`, `@Max()`
  - Arrays: `@IsArray()`, `@ArrayMinSize()`
  - Datas: `@IsDateString()`, `@IsDate()`
- **Mensagens de Erro**: Personalizadas quando necessário
- **Transformações**: `@Transform()` para normalização de dados

### Exemplo de DTO Complexo

```typescript
export class CreateAgentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  temperature?: number;

  @IsObject()
  @ValidateNested()
  @Type(() => AIInstructions)
  instructions: AIInstructions;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sites?: string[];
}
```

## 🗄️ Padrão de Código dos Repositories

### Estrutura Padrão

```typescript
@Injectable()
export class ComponentRepository {
  constructor(
    @InjectRepository(ComponentEntity)
    private readonly repository: Repository<ComponentEntity>,
  ) {}

  async create(data: Partial<ComponentEntity>): Promise<ComponentEntity> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async findById(id: string): Promise<ComponentEntity | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findOne(
    options: FindOneOptions<ComponentEntity>,
  ): Promise<ComponentEntity | null> {
    return await this.repository.findOne(options);
  }

  async update(id: string, data: Partial<ComponentEntity>): Promise<void> {
    await this.repository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }
}
```

### Características dos Repositories

- **TypeORM Integration**: Uso do padrão Repository do TypeORM
- **Métodos CRUD Padrão**:
  - `create()`: Criação de entidades
  - `findById()`: Busca por ID
  - `findOne()`: Busca com opções
  - `find()`: Busca múltiplas entidades
  - `update()`: Atualização parcial
  - `delete()`: Remoção de entidades
- **Null Safety**: Retorno de `null` ao invés de `undefined`
- **Partial Types**: Uso de `Partial<Entity>` para dados parciais
- **Select Específico**: Definição de campos para otimização
- **Raw Queries**: Quando necessário para queries complexas

### Exemplo com Funcionalidades Avançadas

```typescript
@Injectable()
export class MessageRepository {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly repository: Repository<MessageEntity>,
    @Inject(VERTEX_AI_EMBEDDINGS)
    private readonly embeddings: VertexAIEmbeddings,
  ) {}

  async create(data: Partial<MessageEntity>): Promise<MessageEntity> {
    // Geração de embedding para busca vetorial
    const embedding = await this.embeddings.embedQuery(data.message);

    const message = this.repository.create({
      ...data,
      embedding,
    });

    return this.repository.save(message);
  }

  async findBySessionWithRelations(
    sessionId: string,
  ): Promise<MessageEntity[]> {
    return await this.repository.find({
      where: { session_id: sessionId },
      relations: ['session', 'agent'],
      order: { created_at: 'ASC' },
    });
  }
}
```

## 🔒 Padrões de Segurança

- **JWT Authentication**: Tokens seguros com expiração
- **Role-Based Access Control**: Sistema de roles (admin, user)
- **Password Hashing**: Bcrypt para hash de senhas
- **Input Validation**: Validação automática via DTOs
- **SQL Injection Prevention**: TypeORM previne injeções
- **CORS Configuration**: Configurado adequadamente no Fastify

## 📊 Padrões de Observabilidade

- **Structured Logging**: Logs estruturados com Winston
- **Request/Response Logging**: Interceptação de todas as requisições
- **Error Tracking**: Sentry em produção
- **Health Checks**: Endpoints de saúde do sistema
- **Metrics**: Métricas de uso e performance

## 🎯 Melhores Práticas Implementadas

1. **Clean Code**: Código limpo e autodocumentado
2. **SOLID Principles**: Aplicação dos princípios SOLID
3. **DRY**: Don't Repeat Yourself
4. **KISS**: Keep It Simple, Stupid
5. **Type Safety**: Tipagem forte em todo o projeto
6. **Error Handling**: Tratamento consistente de erros
7. **Testing**: Estrutura preparada para testes
8. **Documentation**: Código autodocumentado com tipos claros
