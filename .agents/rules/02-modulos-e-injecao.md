---
trigger: glob
description: 'Módulos Nest e injeção de dependência: os três papéis de *.module.ts, agregadores de domínio, @Global(), escolha do mecanismo de injeção e portas.'
globs: 'src/**/*.module.ts, src/**/contracts/**, src/**/*.port.ts'
---

# Módulos Nest e injeção de dependência

Cobre: os três papéis que um arquivo `*.module.ts` pode desempenhar, como cada um é cabeado e qual mecanismo de injeção de dependência escolher.

## Os três papéis de módulo

Todo arquivo `*.module.ts` desempenha exatamente um destes três papéis:

<tabela>

| Papel                        | Localização                                                                         | `controllers`     | `providers`                           | Quantidade                 |
| ---------------------------- | ----------------------------------------------------------------------------------- | ----------------- | ------------------------------------- | -------------------------- |
| Caso de uso                  | `src/modules/<domain>/<use-case>/<use-case>.module.ts`                              | 1 (0 se auxiliar) | o service do caso de uso              | um por caso de uso         |
| Agregador de domínio         | `src/modules/<domain>/<domain>.module.ts`                                           | nunca             | nunca                                 | um por domínio             |
| Repositório / infraestrutura | `src/modules/<domain>/repositories/*.repository.module.ts`, `src/infrastructure/**` | nunca             | o repositório ou os tokens do recurso | um por agregado ou recurso |

</tabela>

### 1. Módulo de caso de uso

<exemplo>
```ts
import { Module } from '@nestjs/common';

import { CreateAgentController } from 'src/modules/agents/create-agent/create-agent.controller';
import { CreateAgentService } from 'src/modules/agents/create-agent/create-agent.service';
import { AgentRepositoryModule } from 'src/modules/agents/repositories/agent.repository.module';

@Module({
imports: [AgentRepositoryModule],
controllers: [CreateAgentController],
providers: [CreateAgentService],
exports: [CreateAgentService],
})
export class CreateAgentModule {}

````
</exemplo>

<regras>
- Apenas cabeamento (wiring). A lista `imports` é derivada mecanicamente: uma entrada para cada dependência que as classes do próprio módulo injetam, nada além disso.
- Importe apenas os módulos de repositório que o service realmente utiliza. Não existe módulo agregador de repositórios.
- Importe `TransactionExecutorModule` somente se o service abrir uma transação (`TransactionExecutor.run`).
- Provedores de infraestrutura (`VECTOR_STORE_SERVICE`, `CHAT_MODEL_SERVICE`, etc.) não precisam de import: o `InfrastructureModule` é `@Global()` e os publica para toda a aplicação.
- Sempre exporte o service do caso de uso em `exports`.
- Para usar o service de outro caso de uso, importe o módulo daquele caso de uso específico — nunca o módulo agregador do domínio que o contém.
</regras>

### 2. Agregador de domínio

<exemplo>
```ts
@Module({
  imports: [CreateAgentModule, ListAgentsModule, GetAgentModule],
  exports: [CreateAgentModule, ListAgentsModule, GetAgentModule],
})
export class AgentsModule {}
````

</exemplo>

<regras>
- Possui apenas `imports` e `exports`, contendo exatamente a mesma lista de módulos de casos de uso.
- Nunca declara `controllers` nem `providers`.
- É o único módulo do domínio importado pelo `AppModule`.
- Um novo caso de uso adiciona uma entrada em `imports` **e** em `exports` do agregador. Um módulo que compila mas não está encadeado no agregador nunca registra sua rota — sem erro de boot, apenas um 404 silencioso.
</regras>

### 3. Módulo de repositório / infraestrutura

<exemplo>
```ts
@Module({
  imports: [TypeOrmModule.forFeature([AgentEntity])],
  providers: [AgentRepository],
  exports: [AgentRepository],
})
export class AgentRepositoryModule {}
```
</exemplo>

<regras>
- Um módulo de repositório por agregado: importa `TypeOrmModule.forFeature([XEntity])`, provê e exporta uma única classe de repositório. `forFeature` tem escopo local ao módulo — importar um módulo que registrou uma entidade não entrega o `Repository<T>` cru para outros módulos.
- Um módulo que possui um recurso com ciclo de vida (pool de conexões, cliente) implementa `OnApplicationShutdown` e libera o recurso no encerramento.
- Módulos que publicam provedores globalmente usam `@Global()`: `InfrastructureModule` (e módulos de portas que precisam quebrar ciclo de instanciação via `ModuleRef`, como `AgentRuntimeContractsModule` — PC-008). `AuthModule` registra os guards globais.
</regras>

## Escolha do mecanismo de injeção

<tabela>

| Mecanismo                               | Quando usar                                                                     | Exemplos                                     |
| --------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------- |
| Classe concreta                         | Implementação única; padrão para services, repositórios e `TransactionExecutor` | `AgentRepository`, `CreateAgentService`      |
| Token string + `useFactory` (Provider)  | Serviço/cliente externo com fallback mock em testes                             | `VECTOR_STORE_SERVICE`, `CHAT_MODEL_SERVICE` |
| Porta de domínio (`Symbol` + interface) | Capacidade consumida entre domínios ou para quebrar ciclo de instanciação       | `AGENT_RESOLVER` em `contracts/` (PC-008)    |

</tabela>

<checklist>
Decida nesta ordem:

1. Repositório de banco de dados → classe concreta.
2. Integração externa / serviço de terceiros → Provider em `src/infrastructure/providers/` registrado no `InfrastructureModule`.
3. Porta entre domínios consumida por outro domínio → token de porta em `src/modules/<domain>/contracts/`.
4. Qualquer outro caso → classe concreta.
</checklist>

## Regras para classe concreta

<regras>
- Injeção exclusivamente pelo construtor, com `private readonly`.
- A classe injetada usa import de valor, nunca `import type` (ver `01-topologia-e-convencoes.md`, seção Tipagem).
- Todo `@Injectable()` deve estar listado em `providers` de algum módulo.
- Para injetar um provider de outro módulo, importe o módulo que o exporta.
- Proibido criar ciclos entre módulos e proibido usar `forwardRef`.
</regras>

## Provedores e Portas

<exemplo>
```ts
export const VECTOR_STORE_SERVICE = 'VECTOR_STORE_SERVICE';

export interface IVectorStoreService {
loadIndex(filter: { agent_id: string }): Promise<VectorStore>;
upsertChunks(chunks: readonly Document[], metadata: Record<string, unknown>): Promise<void>;
deleteBySourceId(sourceId: string): Promise<void>;
}

````

```ts
constructor(@Inject(VECTOR_STORE_SERVICE) private readonly vectorStore: IVectorStoreService) {}
````

</exemplo>

<regras>
- Dependências externas definem sua constante de token string, interface `I<Name>Service` e array `Provider[]` em `src/infrastructure/providers/<name>.provider.ts`.
- Porta de domínio consumida por outro domínio vive em `src/modules/<domain>/contracts/<name>.port.ts`.
- Consumidores injetam pelo token (`@Inject(TOKEN)`) e tipam pela interface.
- Não crie porta ou provedor sem consumidor real ou sem motivo concreto para abstração.
</regras>

## Verificação após alterar cabeamento de módulos

Sempre que alterar imports/exports/providers de módulos, execute:

```bash
bun run di:verify && bun run di:boot-check
```

- `di:verify`: analisa estaticamente a alcançabilidade de toda injeção, compreende `@Global()` e aponta controllers inalcançáveis a partir do `AppModule`.
- `di:boot-check`: compila o container real do Nest com o `DataSource` simulado — captura exatamente os mesmos erros de injeção que o Nest lançaria no boot, sem precisar de banco de dados ativo.
