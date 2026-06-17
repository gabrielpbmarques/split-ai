---
name: code-patterns
description: 'Use for controller/service/DTO templates and review: error handling, per-handler ValidationPipe, service composition, Promise.all vs allSettled, handler naming (handle/execute), and the NestJS CLI scaffolding commands.'
---

### Creating a new component (scope)

```bash
mkdir <ComponentName>
cd <ComponentName>
nest g module <ComponentName> --flat
```

### Creating a new use case (with endpoint)

```bash
mkdir <UseCaseName>
cd <UseCaseName>
nest g module <UseCaseName> --flat
nest g controller <UseCaseName> --flat --no-spec
nest g service <UseCaseName> --flat --no-spec
```

After scaffolding, adjust the generated files to match the patterns below. The NestJS CLI generates boilerplate that must be adapted.

## Controller Pattern

Each controller belongs to **one use case** and exposes **one endpoint**. A controller NEVER has multiple HTTP handler methods for different operations — each operation is a separate use case with its own controller.

### Standard controller structure

```typescript
import {
  Body,
  Controller,
  Post,
  UseGuards,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { User as AuthUser } from 'src/decorators/user.decorator';
import { User } from 'src/types/models/user.model';

import { CreateOrderDto } from './create-order.dto';
import { CreateOrderService } from './create-order.service';

@Controller('order')
export class CreateOrderController {
  constructor(private readonly createOrderService: CreateOrderService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles('customer', 'admin')
  async handle(
    @Body(new ValidationPipe()) body: CreateOrderDto,
    @AuthUser() user: User,
    @Res() res: FastifyReply,
  ) {
    try {
      const result = await this.createOrderService.execute(body, user);
      return res.status(200).send(result);
    } catch (error: any) {
      return res.status(error.status || 500).send(error.message);
    }
  }
}
```

### Controller rules

1. **Controller name** = scope name in lowercase. The `@Controller('auth')` prefix matches the component, NOT the use case. So `LoginController`, `RegisterDeviceController`, etc all use `@Controller('auth')`.
2. **One handler method per controller**: Named `handle` (preferred) or `execute`. Never create multiple HTTP method handlers in one controller.
3. **Always use @Res() with FastifyReply**`@Res()``FastifyReply`: Never use NestJS default response handling.
4. **Always use @Body(new ValidationPipe())**`@Body(new ValidationPipe())` for request body validation.
5. **Use @Query(new ValidationPipe({ transform: true }))**`@Query(new ValidationPipe({ transform: true }))` for query parameter DTOs — include `transform: true` to enable class-transformer.
6. **Try/catch wraps the service call**: The controller delegates ALL logic to the service and only handles HTTP response formatting.
7. **Use @AuthUser() decorator**`@AuthUser()` (aliased from `User`) to extract the authenticated user when needed.
8. **Decorator order**: `@HttpMethod()` → `@UseGuards(AuthGuard)` → `@Roles(...)`.
9. **No business logic** in controllers — controllers are thin wrappers that delegate to services.

### Error handling in controllers

Standard pattern:

```typescript
try {
  const result = await this.myService.execute(dto);
  return res.status(200).send(result);
} catch (error: any) {
  return res.status(error.status || 500).send(error.message);
}
```

For endpoints returning structured errors:

```typescript
catch (error: any) {
  return res.status(error.status || 500).send({
    statusCode: error.status || 500,
    message: error.message,
    error: error.status >= 500 ? 'Internal Server Error' : 'Bad Request',
  });
}
```

## Service Pattern

### Standard service structure

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderRepository } from 'src/repositories/order.repository';

import { MyDto } from './my.dto';

@Injectable()
export class MyService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(dto: MyDto) {
    // business logic
  }
}
```

### Service rules

1. **Main method is always named execute**`execute`: This is the single public method that the controller calls.
2. **Private helper methods are allowed**: For internal logic decomposition (e.g., `private async checkResourceBelongsToUser()`).
3. **Use early return** for validation and branching — avoid deep nesting.
4. **Delegate data processing to repositories**: If the database query can return the data already processed/filtered, prefer that over processing in the service.
5. **Avoid redundant checks**: Understand the context. If the controller/guard already guarantees a value exists (e.g., authenticated user), don't add an `if (!user)` check in the service.
6. **Use NestJS exceptions**: `NotFoundException`, `BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `ConflictException`, `InternalServerErrorException`.
7. **Dependencies injected via constructor** using `private readonly`.
8. **Infrastructure services use @Inject(TOKEN)**`@Inject(TOKEN)`:

```typescript
constructor(
  @Inject(EXTERNAL_SERVICE_TOKEN)
  private readonly externalService: IExternalService,
) {}
```

### Early return example

```typescript
async execute(id: string) {
  const order = await this.orderRepository.findById(id);
  if (!order) {
    throw new NotFoundException('Recurso não encontrado');
  }

  if (order.status === 'completed') {
    throw new BadRequestException('Não é possível alterar um recurso concluído');
  }

  // proceed with main logic
}
```

### Parallel operations

Use `Promise.all` for independent async operations:

```typescript
const [inventory, activeSubscription] = await Promise.all([
  this.inventoryRepository.checkStock(order.itemId),
  this.subscriptionRepository.findActiveByUserId(user.id),
]);
```

Use `Promise.allSettled` for fire-and-forget notifications where partial failure is acceptable:

```typescript
await Promise.allSettled([
  this.webSocketGateway.notifyNewEvent(createdEntity),
  this.emailNotificationService.execute(createdEntity, user),
  this.analyticsService.trackEvent('entity_created', user.id),
]);
```

## DTO Pattern

DTOs use `class-validator` decorators with one class per DTO file.

### Standard DTO structure

```typescript
import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  deviceFingerprint?: string;
}
```

### DTO rules

1. **One DTO class per file** (multiple related DTOs in the same file are acceptable, e.g., `SendMfaDto` + `VerifyMfaDto`).
2. **Always use class-validator decorators**`class-validator`: `@IsString`, `@IsNotEmpty`, `@IsEmail`, `@IsOptional`, `@IsNumber`, `@IsUUID`, `@IsEnum`, `@IsObject`, `@IsDateString`, `@MinLength`, `@IsIn`, `@IsBoolean`, etc.
3. `@IsOptional()`**@IsOptional() for optional fields**: Combine with the type decorator.
4. **Use @Type(() => Number) from class-transformer**`@Type(() => Number)``class-transformer` for query params that need numeric conversion.
5. **Enums can be defined in the DTO file** when they are specific to that DTO.
6. **Import shared types from src/types**`src/types` for reused types.

## Import Style

### Import ordering

1. External packages (`@nestjs/*`, `bcryptjs`, `typeorm`, etc.)
2. Absolute internal imports (`src/...`)
3. Relative imports (`./`, `../`)

Each group separated by a blank line.
