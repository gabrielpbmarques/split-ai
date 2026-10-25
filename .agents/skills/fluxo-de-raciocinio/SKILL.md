---
name: fluxo-de-raciocinio
description: 'Exemplos práticos (antes e depois) dos princípios de design de services do split-ai: empurrar projeção e filtros para o banco/repositório, tipar retornos explicitamente, usar Pick<> para dados parciais, eliminar checagens redundantes e pensar em fluxo de dados.'
---

# Fluxo de raciocínio para design de services e repositórios

> **Os princípios abaixo são regras obrigatórias**, cujos arquivos donos são `.agents/rules/03-casos-de-uso.md` (regras de service: único `execute()`, tipo de retorno explícito, proibido iterar listas do repositório para moldar payload, pular checagens já garantidas por guards/pipes) e `.agents/rules/04-banco-de-dados.md` (projeção com `fields`, retorno tipado com `Pick<>`). Use esta skill para consultar exemplos concretos de código (antes vs. depois).

Lembrete de idioma (`01-topologia-e-convencoes.md`): todo o código (nomes de classes, métodos, variáveis e tipos) é escrito em **inglês**, sem comentários (`bun run lint:comments`), e as mensagens de exceção são em **português**.

## Princípio 1: Empurre o trabalho para o banco de dados (Repositório)

Antes de escrever qualquer transformação de dados ou seleção de campos em um service, pergunte: **"O repositório pode entregar isso pronto?"**

### Ruim: Mapeamento manual de campos no service

```typescript
async execute(user: AuthenticatedUser): Promise<UserProfile> {
  const foundUser = await this.userRepository.findById(user.id);

  if (!foundUser) {
    throw new NotFoundException('Usuário não encontrado');
  }

  return {
    id: foundUser.id,
    name: foundUser.name,
    email: foundUser.email,
    phone: foundUser.phone,
    role: foundUser.role,
    status: foundUser.status,
    created_at: foundUser.created_at,
  };
}
```

### Bom: O repositório projeta apenas as colunas necessárias no `SELECT`

```typescript
const PROFILE_FIELDS = [
  'id',
  'name',
  'email',
  'phone',
  'role',
  'status',
  'created_at',
] as const satisfies readonly (keyof UserEntity)[];

async execute(user: AuthenticatedUser): Promise<UserProfile> {
  const foundUser = await this.userRepository.findById(user.id, PROFILE_FIELDS);

  if (!foundUser) {
    throw new NotFoundException('Usuário não encontrado');
  }

  return foundUser;
}
```

### Como habilitar isso no repositório

Adicione um parâmetro opcional `fields?: readonly K[]` aos métodos de leitura/listagem do repositório:

```typescript
async findById<K extends keyof UserEntity = keyof UserEntity>(
  id: string,
  fields?: readonly K[],
): Promise<Pick<UserEntity, K> | null> {
  return this.repository.findOne({
    where: { id },
    select: fields ? [...fields] : undefined,
  });
}
```

### Quando estender métodos do repositório

- Quando um caso de uso precisa de um **subconjunto de colunas** de uma entidade → passe `fields` na chamada ao repositório.
- Quando precisa de **dados filtrados ou ordenados** → crie ou use um método dedicado no repositório com o `WHERE` e `ORDER BY` exatos.
- Quando precisa de **dados de múltiplas tabelas (`JOIN`)** ou **colunas calculadas (`COUNT`, `array_agg`)** → adicione um método com `createQueryBuilder` no repositório dono da tabela `FROM`.

**Nunca** faça em memória no service uma filtragem ou projeção que o PostgreSQL resolve diretamente na query.

## Princípio 2: Sempre declare explicitamente o tipo de retorno

Todo método público `execute()` em um service **deve** declarar seu tipo de retorno explicitamente. Nunca deixe inferido.

```typescript
async execute(user: AuthenticatedUser): Promise<UserProfile> {
  ...
}
```

## Princípio 3: Crie tipos dedicados para dados parciais (`Pick<>`)

Quando um caso de uso retorna um subconjunto das colunas de uma entidade, defina um tipo dedicado usando `Pick<>` em `src/shared/contracts/models/<name>.model.ts` (ou no próprio arquivo do service quando for exclusivo de uma listagem):

```typescript
export type UserProfile = Pick<
  UserEntity,
  'id' | 'name' | 'email' | 'role' | 'phone' | 'status' | 'created_at'
>;
```

- Use `Pick<Base, Fields>` quando o retorno for um subconjunto estrito de uma entidade existente.
- Use uma nova `interface` quando o retorno incluir campos calculados, agregações ou dados vindos de um `JOIN` entre tabelas.
- Sempre reexporte novos modelos públicos em `src/shared/contracts/models/index.ts`.

## Princípio 4: Evite checagens redundantes, fallbacks mortos e helpers duplicados

Antes de adicionar um `if`, um fallback ou um método privado auxiliar, pergunte:

1. **"Esse valor já é garantido pela cadeia de chamadas (Guards / ValidationPipe)?"**
   - Em qualquer rota sem `@Public()`, `AuthenticationGuard` e `AuthorizationGuard` já garantem que `user` existe e tem a permissão da rota.
   - Em qualquer `@Body() dto: XDto` ou `@Query() dto: XDto`, o `ValidationPipe` global já garante os tipos e campos obrigatórios.
2. **"O repositório já possui esse método de busca?"**
   - Nunca escreva um `private resolveAgent(idOrIdentifier)` em um service quando `this.agentRepository.findByIdOrIdentifier(idOrIdentifier)` já existe.
3. **"Esse fallback faz sentido para o backend configurado?"**
   - Se uma rota de memória ou skill é lida exclusivamente do `PostgresStore`, não adicione fallback de leitura em disco (`fs`) nem loops de desduplicação que mascaram a estrutura real do namespace.

### Ruim

```typescript
async execute(dto: CreateAgentDto, user: AuthenticatedUser): Promise<AgentEntity> {
  if (!user) {
    throw new UnauthorizedException('Usuário não autenticado');
  }
  if (!dto.name) {
    throw new BadRequestException('O nome é obrigatório');
  }
  ...
}
```

### Bom

```typescript
async execute(dto: CreateAgentDto, user: AuthenticatedUser): Promise<AgentEntity> {
  return this.agentRepository.create({
    name: dto.name,
    ...
    user_id: user.id,
  });
}
```

## Princípio 5: Pense em fluxo de dados e paralelismo

Ao implementar um caso de uso, trace o caminho dos dados da entrada até a saída:

```text
Precisa retornar um subconjunto de campos?
  → Passe `fields` para o método do repositório
  → Crie um tipo `Pick<>` para o formato de retorno
  → Declare o retorno explícito em `execute()`

Precisa transformar ou agregar dados?
  → O banco de dados pode fazer isso (SQL, JOIN, COUNT, array_agg)?
    → Sim: Adicione o método no repositório
    → Não: Transforme no service com o mínimo de complexidade

Precisa validar algo?
  → Já é garantido por guards, pipes ou DTOs?
    → Sim: Não valide novamente
    → Não: Valide no início de `execute()` e lance a HttpException adequada em português

Precisa executar múltiplas operações assíncronas?
  → Elas são independentes entre si?
    → Sim, e todas precisam ter sucesso: `Promise.all([...])`
    → Sim, e são efeitos colaterais em background que não podem rejeitar: `Promise.allSettled([...])`
    → Não (a segunda depende do resultado da primeira): `await` sequencial
```
