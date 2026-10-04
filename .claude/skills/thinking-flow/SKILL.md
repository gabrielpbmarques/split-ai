---
name: thinking-flow
description: "Worked code examples for this repo's service-design principles — push work to the DB/repository, explicit return types, Pick<> for partial data, skip guard-guaranteed checks, data-flow thinking. The principles are always-on in CLAUDE.md (Service & reasoning conventions); open this for the before/after examples."
---

> **The principles below are always-on rules** in the root `CLAUDE.md` ("Service & reasoning conventions") — they apply whether or not this skill is open. This file is the **worked-example companion**: open it for the before/after code that makes each principle concrete.

You define HOW to think about implementation decisions when working on this NestJS backend — pushing data processing to the database, avoiding manual object mapping, ensuring explicit typing, and keeping services lean.

Follow these thinking principles in order. They reflect the project owner's reasoning style.

## Principle 1: Push Work to the Database Layer

Before writing any data transformation or field selection in a service, ask: **"Can the repository handle this?"**

### Bad: Manual field mapping in the service

```typescript
async execute(user: User): Promise<UserProfile> {
  const foundUser = await this.userRepository.findById(user.id);

  if (!foundUser) {
    throw new NotFoundException('Usuário não encontrado');
  }

  // ❌ Manually picking fields — this work belongs in the repository
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

### Good: Leverage the repository to return only what's needed

```typescript
async execute(user: User): Promise<UserProfile> {
  const foundUser = await this.userRepository.findById(user.id, [
    'id', 'name', 'email', 'phone', 'role', 'status', 'created_at',
  ]);

  if (!foundUser) {
    throw new NotFoundException('Usuário não encontrado');
  }

  return foundUser;
}
```

### How to enable this

Add an optional `select` parameter to repository methods. This allows callers to specify which columns to retrieve:

```typescript
async findById(id: string, select?: (keyof UserEntity)[]): Promise<UserEntity | null> {
  return this.userRepository.findOne({
    where: { id },
    ...(select && { select }),
  });
}
```

**Key insight**: The repository already talks to the database — let it control what comes back. Don't fetch all columns and then discard most of them in the service.

### When to extend repository methods

- When a use case needs a **subset of fields** from an entity → add an optional `select` parameter.
- When a use case needs **filtered/sorted data** → add a dedicated query method in the repository with the right `WHERE`/`ORDER BY`.
- When a use case needs **joined data** or **computed fields** → add a raw SQL query method in the repository.

**Never** add data transformation in the service that could be handled by the query itself.

## Principle 2: Always Type Return Values Explicitly

Every `execute()` method MUST have an explicit return type. Never leave it inferred.

### Bad

```typescript
async execute(user: User) {
  // Return type is inferred — unclear contract
}
```

### Good

```typescript
async execute(user: User): Promise<UserProfile> {
  // Explicit type — clear contract for the caller
}
```

This applies to **all public methods** in services. Private helper methods can rely on inference if the logic is simple.

## Principle 3: Create Dedicated Types for Partial Data

When a use case returns a **subset of an entity's fields**, create a dedicated type using `Pick<>` from the base interface.

### Where to define it

In `src/types/models/`, in the same file as the base type — or in its own file if it represents a distinct concept.

### Pattern

```typescript
// In src/types/models/user.model.ts
export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  phone: string;
  status: UserStatus;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export type UserProfile = Pick<
  User,
  | 'id'
  | 'name'
  | 'email'
  | 'role'
  | 'phone'
  | 'status'
  | 'created_at'
  | 'updated_at'
>;
```

### When to use `Pick` vs a new interface

- `Pick<Base, Fields>`**Pick<Base, Fields>**: When the type is a strict subset of an existing interface — no new fields, no transformations.
- **New interface**: When the return shape includes computed fields, joined data, or fields from multiple entities.

### Don't forget the barrel export

After adding a new type, ensure it's exported through the barrel:

- `src/types/models/index.ts` re-exports the file
- `src/types/index.ts` re-exports `models/`

## Principle 4: Avoid Redundant Safety Checks

Before adding a null/undefined check, ask: **"Is this value already guaranteed by the call chain?"**

### Context awareness checklist

1. **Is the user authenticated?** On any route without `@Public()`, the global guards guarantee `request.user`; `@AuthUser()` never returns undefined.
2. **Is the input validated?** If `@Body(new ValidationPipe())` is used with a DTO, required fields are guaranteed to exist.
3. **Is the entity guaranteed to exist?** If a previous step in the same `execute()` already threw `NotFoundException`, subsequent code can trust the entity exists.

### Bad

```typescript
async execute(data: CreateOrderDto, user: User) {
  // ❌ AuthGuard already guarantees user exists
  if (!user) {
    throw new UnauthorizedException('Usuário não autenticado');
  }

  // ❌ ValidationPipe already guarantees productId is a string
  if (!data.productId) {
    throw new BadRequestException('O ID do produto é obrigatório');
  }
}
```

### Good

```typescript
async execute(data: CreateOrderDto, user: User) {
  // Proceed directly — the guard and validation pipeline already handle these checks
  const inventory = await this.checkInventoryService.execute({
    productId: data.productId,
    quantity: data.quantity,
  });
}
```

## Principle 5: Think in Data Flow, Not in Steps

When implementing a feature, trace the data flow from input to output:

1. **What data enters?** (DTO, authenticated user, route params)
2. **What data do I need from the database?** (Which fields? Which joins? Which filters?)
3. **What transformations are needed?** (Can the DB do it? Or must it be in code?)
4. **What shape does the response need?** (Create a type for it)
5. **What can go wrong?** (Only validate what ISN'T already guaranteed)

This flow naturally leads to:

- Lean services with minimal logic
- Smart repository methods that return exactly what's needed
- Explicit types for every response shape
- No redundant checks

## Decision Tree Summary

```text
Need to return a subset of fields?
  → Add optional `select` param to repository method
  → Create a `Pick<>` type for the return shape
  → Type the service `execute()` return explicitly

Need to transform data?
  → Can the DB handle it (SQL, computed columns)?
    → Yes: Add a repository method with the right query
    → No: Transform in the service, but keep it minimal

Need to validate something?
  → Is it already guaranteed by guards/pipes/DTOs?
    → Yes: Skip it
    → No: Add early return validation at the top of execute()

Need to call multiple async operations?
  → Are they independent?
    → Yes + all must succeed: Promise.all
    → Yes + partial failure OK: Promise.allSettled
    → No: Sequential await
```
