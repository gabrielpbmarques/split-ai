---
name: main-instructions
description: 'Use when: getting a quick overview of the project stack, framework choices, API prefix, auth strategy, or top-level conventions. Use as a starting point before diving into specific skills (architecture, code-patterns, tech-stack, etc.).'
---

## Quick Reference

- **Language**: TypeScript (strict)

- **Framework**: NestJS with Fastify adapter

- **ORM**: TypeORM

- **Validation**: class-validator + class-transformer (global ValidationPipe)

- **API prefix**: `/api`

- **Auth**: JWT-based with custom guards (`AuthGuard`, `DeviceGuard`, `SubscriptionGuard`)

## Key Patterns

- Use cases follow a scope/use-case directory structure inside `src/components/`.

- Always import `RepositoriesModule` and `InfrastructureModule` as wholes — never individual providers or repositories.

- Services expose an `execute()` method. Controllers use `handle()` or `execute()`.

- DTOs use `class-validator` decorators.

- Controllers use Fastify types (`FastifyReply`) with `@Res()`.

- Error messages are in Portuguese for user-facing responses.

- Early return pattern for validations and branching.
