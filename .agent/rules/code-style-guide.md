---
trigger: always_on
---

# Guia de Estilo de Código (Code Style Guide) - Split AI

Este documento define as diretrizes de estilo de código para o projeto `split-ai`. O objetivo é manter a base de código consistente, legível e fácil de manter.

## 1. Formatação e Linting

O projeto utiliza **ESLint** e **Prettier** para garantir consistência.

- **Aspas**: Simples (`'`) em vez de duplas (`"`), exceto em JSON.
- **Ponto e Vírgula**: Obrigatório ao final das instruções.
- **Indentação**: 2 espaços.
- **Trailing Commas**: Sempre que possível (`all`), incluindo argumentos de função e objetos.
- **Linhas em Branco**:
  - Uma linha entre declarações de classe e métodos.
  - Uma linha entre blocos lógicos dentro de funções.
- **Import Order**:
  - O ESLint está configurado para ordenar imports automaticamente:
    1.  Built-in (Node.js)
    2.  External (Libraries: `@nestjs`, `fastify`, etc.)
    3.  Internal (Aliases: `src/...`)
    4.  Parent (`../`)
    5.  Sibling (`./`)
    6.  Index (`.`)
  - Ordem alfabética (case-insensitive) dentro dos grupos.

## 2. Convenções de Nomenclatura

### 2.1. Arquivos e Diretórios

- **Kebab-case**: Todos os nomes de arquivos e pastas devem ser em minúsculas separadas por hífens.
  - `create-agent.service.ts`
  - `user.entity.ts`
  - `auth.guard.ts`
- **Sufixos de Tipo**: O nome do arquivo deve refletir seu tipo.
  - `.module.ts`, `.controller.ts`, `.service.ts`, `.entity.ts`, `.dto.ts`

### 2.2. Classes e Tipos

- **PascalCase**: Usado para nomes de Classes, Interfaces, Enums e Decorators.
  - `class QuestionService {}`
  - `interface CustomMetadata {}`
  - `class UserEntity {}`
- **Sem Prefixo "I"**: Não use `IUser` para interfaces. Use o nome direto `User` ou `UserInterface` se estritamente necessário para desambiguação (mas prefira nomes semânticos).

### 2.3. Variáveis e Funções

- **camelCase**: Usado para propriedades, variáveis locais, nomes de métodos e argumentos.
  - `const agentId = ...`
  - `async execute(...)`
- **Constantes Globais**: UPPER_CASE (SNAKE_CASE) para constantes estáticas definidas no topo do arquivo.
  - `const STREAM = true;`

## 3. TypeScript e Tipagem

### 3.1. Tipos Explícitos

- Embora o `explicit-function-return-type` esteja `off` no ESLint, a **boa prática** observada no projeto é declarar o tipo de retorno de métodos públicos de Controllers e Services.
  - `async execute(...): Promise<void>`
  - `async execute(...): Promise<string | AIMessageChunk[]>`

### 3.2. Uso do `any`

- O uso de `any` é permitido (`no-explicit-any: off`), mas deve ser evitado a menos que estritamente necessário (ex: integração com bibliotecas de terceiros complexas ou tratamento genérico de erros onde o tipo é desconhecido).
  - Preferir `unknown` quando o tipo não é garantido.

### 3.3. DTOs

- Sempre use Classes (não Interfaces) para DTOs para permitir o uso de decorators do `class-validator`.
  - Campos obrigatórios: `@IsNotEmpty()`
  - Campos opcionais: `@IsOptional()`

## 4. Estrutura de Arquivos

### 4.1. Ordem dos Membros da Classe

1.  **Propriedades estáticas**
2.  **Propriedades de instância** (Injeções de dependência costumam ser feitas via construtor)
3.  **Constructor**: Onde a injeção acontece.
4.  **Métodos Públicos**: `execute()` ou `handle()` geralmente vem primeiro.
5.  **Métodos Privados**: Métodos auxiliares (`private async generateResponse(...)`) ficam no final.

### 4.2. Comentários

- O projeto aceita comentários em **Português** e **Inglês**, mas a consistência dentro do arquivo é importante.
- Use JSDoc (`/** ... */`) para métodos públicos complexos se necessário.

## 5. Exemplo de Estilo (Snippet)

```typescript
import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/entities';
import { QuestionDto } from './question.dto';

// Constante global
const MAX_RETRIES = 3;

@Injectable()
export class ExampleService {
  constructor(private readonly otherService: OtherService) {}

  // Método público com tipo de retorno explícito
  async execute(dto: QuestionDto, user: UserEntity): Promise<void> {
    const { question } = dto;

    if (!question) {
      throw new Error('Question required');
    }

    await this.processInternal(question);
  }

  // Método privado auxiliar (camelCase)
  private async processInternal(data: string): Promise<void> {
    // ...
  }
}
```

## 6. Logs

- Utilize o `Logger` do `@nestjs/common`.
- Evite `console.log` em produção.

## 7. Configuração e Variáveis de Ambiente

- Não use `process.env` diretamente no código de negócio. Importe o objeto `config` de `src/config.ts`.
