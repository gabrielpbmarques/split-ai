# Mapa de injeção de dependências

Gerado por `bun run scripts/refactor-di/document.ts`. Documento de trabalho — apagar após a conclusão do refactor.

## Padrão

Cada módulo de use case importa **apenas** os módulos que fornecem o que suas próprias classes (service, controller, guards) injetam. Não existem mais módulos guarda-chuva.

| camada           | módulo                                                                    | fornece                                               |
| ---------------- | ------------------------------------------------------------------------- | ----------------------------------------------------- |
| repositório      | `src/repositories/<x>.repository.module.ts` → `XRepositoryModule`         | `TypeOrmModule.forFeature([XEntity])` + `XRepository` |
| provider externo | `src/infrastructure/providers/<x>.provider.module.ts` → `XProviderModule` | os tokens declarados em `<x>.provider.ts`             |
| use case         | `src/components/<Scope>/<UseCase>/<x>.module.ts`                          | o service do use case                                 |
| agregador        | `src/components/<Scope>/<scope>.module.ts`                                | nada — só importa os use cases para registrar rotas   |

## Módulos de repositório

| módulo                                | entidade (`forFeature`)     | exporta                         | imports extras                   |
| ------------------------------------- | --------------------------- | ------------------------------- | -------------------------------- |
| `AgentConnectionRepositoryModule`     | `AgentConnectionEntity`     | `AgentConnectionRepository`     | —                                |
| `AgentInstructionRepositoryModule`    | `AgentInstructionEntity`    | `AgentInstructionRepository`    | —                                |
| `AgentRepositoryModule`               | `AgentEntity`               | `AgentRepository`               | —                                |
| `ApiKeyRepositoryModule`              | `ApiKeyEntity`              | `ApiKeyRepository`              | —                                |
| `CreditBalanceRepositoryModule`       | `CreditBalanceEntity`       | `CreditBalanceRepository`       | —                                |
| `CreditTransactionRepositoryModule`   | `CreditTransactionEntity`   | `CreditTransactionRepository`   | —                                |
| `FeatureRepositoryModule`             | `FeatureEntity`             | `FeatureRepository`             | —                                |
| `MessageRepositoryModule`             | `MessageEntity`             | `MessageRepository`             | `VoyageEmbeddingsProviderModule` |
| `NotificationRepositoryModule`        | `NotificationEntity`        | `NotificationRepository`        | —                                |
| `OrganizationFeatureRepositoryModule` | `OrganizationFeatureEntity` | `OrganizationFeatureRepository` | —                                |
| `OrganizationRepositoryModule`        | `OrganizationEntity`        | `OrganizationRepository`        | —                                |
| `PaymentRepositoryModule`             | `PaymentEntity`             | `PaymentRepository`             | —                                |
| `PlanRepositoryModule`                | `PlanEntity`                | `PlanRepository`                | —                                |
| `ReportRepositoryModule`              | `ReportEntity`              | `ReportRepository`              | —                                |
| `SessionRepositoryModule`             | `SessionEntity`             | `SessionRepository`             | —                                |
| `SmsVerificationRepositoryModule`     | `SmsVerificationEntity`     | `SmsVerificationRepository`     | —                                |
| `SourceRepositoryModule`              | `SourceEntity`              | `SourceRepository`              | —                                |
| `SubscriptionRepositoryModule`        | `SubscriptionEntity`        | `SubscriptionRepository`        | —                                |
| `TokenUsageRepositoryModule`          | `TokenUsageEntity`          | `TokenUsageRepository`          | —                                |
| `UniversalDataRepositoryModule`       | `—`                         | `UniversalDataRepository`       | —                                |
| `UserRepositoryModule`                | `UserEntity`                | `UserRepository`                | —                                |
| `UserTokenRepositoryModule`           | `UserTokenEntity`           | `UserTokenRepository`           | —                                |

## Módulos de provider

| módulo                           | tokens exportados                           | imports                          |
| -------------------------------- | ------------------------------------------- | -------------------------------- |
| `AnthropicProviderModule`        | `ANTHROPIC_CHAT`                            | —                                |
| `ElevenLabsProviderModule`       | `ELEVEN_LABS_CLIENT`, `ELEVEN_LABS_SERVICE` | —                                |
| `GcpStorageProviderModule`       | `GCP_STORAGE_SERVICE`                       | `ConfigModule`                   |
| `GoogleVoiceProviderModule`      | `GOOGLE_VOICE_SERVICE`                      | `ConfigModule`                   |
| `SendGridProviderModule`         | `SENDGRID_CLIENT`, `EMAIL_SERVICE`          | —                                |
| `SpiderProviderModule`           | `SPIDER_SERVICE`                            | —                                |
| `StripeProviderModule`           | `STRIPE_CLIENT`                             | —                                |
| `SupabaseProviderModule`         | `SUPABASE_CLIENT`, `SUPABASE_SERVICE`       | `VoyageEmbeddingsProviderModule` |
| `TwilioProviderModule`           | `TWILIO_CLIENT`, `TWILIO_SERVICE`           | —                                |
| `VoyageEmbeddingsProviderModule` | `VOYAGE_EMBEDDINGS`                         | —                                |

## Componentes

### AgentConnection

Agregador `AgentConnectionModule` (`src/components/AgentConnection/agent-connection.module.ts`) importa: `CreateAgentConnectionModule`, `ListAgentConnectionsModule`, `UpdateAgentConnectionModule`, `DeleteAgentConnectionModule`, `SaveAgentConnectionLayoutModule`. Sem `exports`.

#### `CreateAgentConnectionModule`

`src/components/AgentConnection/CreateAgentConnection/create-agent-connection.module.ts`

| classe                            | injeta                         | fornecido por                     |
| --------------------------------- | ------------------------------ | --------------------------------- |
| `CreateAgentConnectionService`    | `AgentConnectionRepository`    | `AgentConnectionRepositoryModule` |
| `CreateAgentConnectionService`    | `AgentRepository`              | `AgentRepositoryModule`           |
| `CreateAgentConnectionController` | `CreateAgentConnectionService` | próprio módulo                    |
| `AuthGuard`                       | `Reflector`                    | global (Nest/TypeORM)             |
| `OrgRoleGuard`                    | `Reflector`                    | global (Nest/TypeORM)             |

**imports:** `AgentConnectionRepositoryModule`, `AgentRepositoryModule`

#### `DeleteAgentConnectionModule`

`src/components/AgentConnection/DeleteAgentConnection/delete-agent-connection.module.ts`

| classe                            | injeta                         | fornecido por                     |
| --------------------------------- | ------------------------------ | --------------------------------- |
| `DeleteAgentConnectionService`    | `AgentConnectionRepository`    | `AgentConnectionRepositoryModule` |
| `DeleteAgentConnectionController` | `DeleteAgentConnectionService` | próprio módulo                    |
| `AuthGuard`                       | `Reflector`                    | global (Nest/TypeORM)             |
| `OrgRoleGuard`                    | `Reflector`                    | global (Nest/TypeORM)             |

**imports:** `AgentConnectionRepositoryModule`

#### `ListAgentConnectionsModule`

`src/components/AgentConnection/ListAgentConnections/list-agent-connections.module.ts`

| classe                           | injeta                        | fornecido por                     |
| -------------------------------- | ----------------------------- | --------------------------------- |
| `ListAgentConnectionsService`    | `AgentConnectionRepository`   | `AgentConnectionRepositoryModule` |
| `ListAgentConnectionsService`    | `AgentRepository`             | `AgentRepositoryModule`           |
| `ListAgentConnectionsController` | `ListAgentConnectionsService` | próprio módulo                    |
| `AuthGuard`                      | `Reflector`                   | global (Nest/TypeORM)             |
| `OrgRoleGuard`                   | `Reflector`                   | global (Nest/TypeORM)             |

**imports:** `AgentConnectionRepositoryModule`, `AgentRepositoryModule`

#### `SaveAgentConnectionLayoutModule`

`src/components/AgentConnection/SaveAgentConnectionLayout/save-agent-connection-layout.module.ts`

| classe                                | injeta                             | fornecido por           |
| ------------------------------------- | ---------------------------------- | ----------------------- |
| `SaveAgentConnectionLayoutService`    | `AgentRepository`                  | `AgentRepositoryModule` |
| `SaveAgentConnectionLayoutController` | `SaveAgentConnectionLayoutService` | próprio módulo          |
| `AuthGuard`                           | `Reflector`                        | global (Nest/TypeORM)   |
| `OrgRoleGuard`                        | `Reflector`                        | global (Nest/TypeORM)   |

**imports:** `AgentRepositoryModule`

#### `UpdateAgentConnectionModule`

`src/components/AgentConnection/UpdateAgentConnection/update-agent-connection.module.ts`

| classe                            | injeta                         | fornecido por                     |
| --------------------------------- | ------------------------------ | --------------------------------- |
| `UpdateAgentConnectionService`    | `AgentConnectionRepository`    | `AgentConnectionRepositoryModule` |
| `UpdateAgentConnectionController` | `UpdateAgentConnectionService` | próprio módulo                    |
| `AuthGuard`                       | `Reflector`                    | global (Nest/TypeORM)             |
| `OrgRoleGuard`                    | `Reflector`                    | global (Nest/TypeORM)             |

**imports:** `AgentConnectionRepositoryModule`

### AIChat

Agregador `AIChatModule` (`src/components/AIChat/ai-chat.module.ts`) importa: `QuestionModule`, `AttendantModule`. Sem `exports`.

#### `AttendantModule`

`src/components/AIChat/Attendant/attendant.module.ts`

| classe                | injeta                            | fornecido por                    |
| --------------------- | --------------------------------- | -------------------------------- |
| `AttendantService`    | `GenerateAiResponseService`       | `GenerateAiResponseModule`       |
| `AttendantService`    | `CreateSessionIfNotExistsService` | `CreateSessionIfNotExistsModule` |
| `AttendantService`    | `ResolveAgentService`             | `ResolveAgentModule`             |
| `AttendantService`    | `RecordChatMessageService`        | `RecordChatMessageModule`        |
| `AttendantController` | `AttendantService`                | próprio módulo                   |
| `AuthGuard`           | `Reflector`                       | global (Nest/TypeORM)            |
| `ActiveOrgGuard`      | `DataSource`                      | global (Nest/TypeORM)            |

**imports:** `CreateSessionIfNotExistsModule`, `GenerateAiResponseModule`, `RecordChatMessageModule`, `ResolveAgentModule`

#### `QuestionModule`

`src/components/AIChat/Question/question.module.ts`

| classe               | injeta                            | fornecido por                    |
| -------------------- | --------------------------------- | -------------------------------- |
| `QuestionService`    | `GenerateAiResponseService`       | `GenerateAiResponseModule`       |
| `QuestionService`    | `CreateSessionIfNotExistsService` | `CreateSessionIfNotExistsModule` |
| `QuestionService`    | `ResolveAgentService`             | `ResolveAgentModule`             |
| `QuestionService`    | `RecordChatMessageService`        | `RecordChatMessageModule`        |
| `AuthGuard`          | `Reflector`                       | global (Nest/TypeORM)            |
| `ApiKeyGuard`        | `ApiKeyRepository`                | `ApiKeyRepositoryModule`         |
| `ApiKeyGuard`        | `OrganizationRepository`          | `OrganizationRepositoryModule`   |
| `CompositeAuthGuard` | `AuthGuard`                       | próprio módulo                   |
| `CompositeAuthGuard` | `ApiKeyGuard`                     | próprio módulo                   |
| `QuestionController` | `QuestionService`                 | próprio módulo                   |
| `ActiveOrgGuard`     | `DataSource`                      | global (Nest/TypeORM)            |

**imports:** `ApiKeyRepositoryModule`, `CreateSessionIfNotExistsModule`, `GenerateAiResponseModule`, `OrganizationRepositoryModule`, `RecordChatMessageModule`, `ResolveAgentModule`

#### `RecordChatMessageModule`

`src/components/AIChat/RecordChatMessage/record-chat-message.module.ts`

| classe                     | injeta              | fornecido por             |
| -------------------------- | ------------------- | ------------------------- |
| `RecordChatMessageService` | `MessageRepository` | `MessageRepositoryModule` |

**imports:** `MessageRepositoryModule`

### Analytics

Agregador `AnalyticsModule` (`src/components/Analytics/analytics.module.ts`) importa: `GetDashboardDataModule`. Sem `exports`.

#### `GetDashboardDataModule`

`src/components/Analytics/GetDashboardData/get-dashboard-data.module.ts`

| classe                       | injeta                    | fornecido por            |
| ---------------------------- | ------------------------- | ------------------------ |
| `GetDashboardDataService`    | `ReportRepository`        | `ReportRepositoryModule` |
| `GetDashboardDataController` | `GetDashboardDataService` | próprio módulo           |
| `AuthGuard`                  | `Reflector`               | global (Nest/TypeORM)    |

**imports:** `ReportRepositoryModule`

### ApiKey

Agregador `ApiKeyModule` (`src/components/ApiKey/api-key.module.ts`) importa: `CreateApiKeyModule`, `ListApiKeysModule`, `RevokeApiKeyModule`. Sem `exports`.

#### `CreateApiKeyModule`

`src/components/ApiKey/CreateApiKey/create-api-key.module.ts`

| classe                   | injeta                | fornecido por            |
| ------------------------ | --------------------- | ------------------------ |
| `CreateApiKeyService`    | `ApiKeyRepository`    | `ApiKeyRepositoryModule` |
| `CreateApiKeyController` | `CreateApiKeyService` | próprio módulo           |
| `AuthGuard`              | `Reflector`           | global (Nest/TypeORM)    |
| `OrgRoleGuard`           | `Reflector`           | global (Nest/TypeORM)    |

**imports:** `ApiKeyRepositoryModule`

#### `ListApiKeysModule`

`src/components/ApiKey/ListApiKeys/list-api-keys.module.ts`

| classe                  | injeta               | fornecido por            |
| ----------------------- | -------------------- | ------------------------ |
| `ListApiKeysService`    | `ApiKeyRepository`   | `ApiKeyRepositoryModule` |
| `ListApiKeysController` | `ListApiKeysService` | próprio módulo           |
| `AuthGuard`             | `Reflector`          | global (Nest/TypeORM)    |
| `OrgRoleGuard`          | `Reflector`          | global (Nest/TypeORM)    |

**imports:** `ApiKeyRepositoryModule`

#### `RevokeApiKeyModule`

`src/components/ApiKey/RevokeApiKey/revoke-api-key.module.ts`

| classe                   | injeta                | fornecido por            |
| ------------------------ | --------------------- | ------------------------ |
| `RevokeApiKeyService`    | `ApiKeyRepository`    | `ApiKeyRepositoryModule` |
| `RevokeApiKeyController` | `RevokeApiKeyService` | próprio módulo           |
| `AuthGuard`              | `Reflector`           | global (Nest/TypeORM)    |
| `OrgRoleGuard`           | `Reflector`           | global (Nest/TypeORM)    |

**imports:** `ApiKeyRepositoryModule`

### ArtificialIntelligence

Agregador `ArtificialIntelligenceModule` (`src/components/ArtificialIntelligence/artificial-intelligence.module.ts`) importa: `ConvertTextToSpeechModule`, `ExecuteSimilaritySearchModule`, `LoadVectorStoreModule`, `BuildSystemPromptModule`, `NormalizePromptInstructionsModule`, `GenerateAiResponseModule`, `CreateAgentModule`, `UpdateAgentModule`, `ListAgentsModule`, `CreateAttendantAgentModule`, `LoadAgentSitesModule`, `LoadVectorSearchToolModule`, `TokenUsageModule`, `ResolveAgentModule`, `InvokeConnectedAgentModule`, `AppendConnectionToolsModule`. Sem `exports`.

#### `AppendConnectionToolsModule`

`src/components/ArtificialIntelligence/AppendConnectionTools/append-connection-tools.module.ts`

| classe                         | injeta                        | fornecido por                     |
| ------------------------------ | ----------------------------- | --------------------------------- |
| `AppendConnectionToolsService` | `AgentConnectionRepository`   | `AgentConnectionRepositoryModule` |
| `AppendConnectionToolsService` | `InvokeConnectedAgentService` | `InvokeConnectedAgentModule`      |

**imports:** `AgentConnectionRepositoryModule`, `InvokeConnectedAgentModule`

#### `BuildSystemPromptModule`

`src/components/ArtificialIntelligence/BuildSystemPrompt/build-system-prompt.module.ts`

| classe                     | injeta                               | fornecido por                       |
| -------------------------- | ------------------------------------ | ----------------------------------- |
| `BuildSystemPromptService` | `NormalizePromptInstructionsService` | `NormalizePromptInstructionsModule` |

**imports:** `NormalizePromptInstructionsModule`

#### `ConvertTextToSpeechModule`

`src/components/ArtificialIntelligence/ConvertTextToSpeech/convert-text-to-speech.module.ts`

| classe                          | injeta                       | fornecido por               |
| ------------------------------- | ---------------------------- | --------------------------- |
| `ConvertTextToSpeechService`    | `GOOGLE_VOICE_SERVICE`       | `GoogleVoiceProviderModule` |
| `ConvertTextToSpeechService`    | `GCP_STORAGE_SERVICE`        | `GcpStorageProviderModule`  |
| `ConvertTextToSpeechController` | `ConvertTextToSpeechService` | próprio módulo              |

**imports:** `GcpStorageProviderModule`, `GoogleVoiceProviderModule`

#### `CreateAgentModule`

`src/components/ArtificialIntelligence/CreateAgent/create-agent.module.ts`

| classe                  | injeta                       | fornecido por                      |
| ----------------------- | ---------------------------- | ---------------------------------- |
| `CreateAgentService`    | `AgentRepository`            | `AgentRepositoryModule`            |
| `CreateAgentService`    | `AgentInstructionRepository` | `AgentInstructionRepositoryModule` |
| `CreateAgentService`    | `OrganizationRepository`     | `OrganizationRepositoryModule`     |
| `CreateAgentController` | `CreateAgentService`         | próprio módulo                     |
| `AuthGuard`             | `Reflector`                  | global (Nest/TypeORM)              |
| `OrgRoleGuard`          | `Reflector`                  | global (Nest/TypeORM)              |

**imports:** `AgentInstructionRepositoryModule`, `AgentRepositoryModule`, `OrganizationRepositoryModule`

#### `CreateAttendantAgentModule`

`src/components/ArtificialIntelligence/CreateAttendantAgent/create-attendant-agent.module.ts`

| classe                           | injeta                        | fornecido por                      |
| -------------------------------- | ----------------------------- | ---------------------------------- |
| `CreateAttendantAgentService`    | `AgentRepository`             | `AgentRepositoryModule`            |
| `CreateAttendantAgentService`    | `AgentInstructionRepository`  | `AgentInstructionRepositoryModule` |
| `CreateAttendantAgentController` | `CreateAttendantAgentService` | próprio módulo                     |
| `AuthGuard`                      | `Reflector`                   | global (Nest/TypeORM)              |

**imports:** `AgentInstructionRepositoryModule`, `AgentRepositoryModule`

#### `ExecuteSimilaritySearchModule`

`src/components/ArtificialIntelligence/ExecuteSimilaritySearch/execute-similarity-search.module.ts`

| classe                           | injeta              | fornecido por                    |
| -------------------------------- | ------------------- | -------------------------------- |
| `ExecuteSimilaritySearchService` | `VOYAGE_EMBEDDINGS` | `VoyageEmbeddingsProviderModule` |

**imports:** `VoyageEmbeddingsProviderModule`

#### `GenerateAiResponseModule`

`src/components/ArtificialIntelligence/GenerateAIResponse/generate-ai-response.module.ts`

| classe | injeta                      | fornecido por |
| ------ | --------------------------- | ------------- |
| —      | nenhuma dependência externa | —             |

**imports:** —

#### `InvokeConnectedAgentModule`

`src/components/ArtificialIntelligence/InvokeConnectionAgent/invoke-connected-agent.module.ts`

| classe                        | injeta                | fornecido por        |
| ----------------------------- | --------------------- | -------------------- |
| `InvokeConnectedAgentService` | `ResolveAgentService` | `ResolveAgentModule` |

**imports:** `ResolveAgentModule`

#### `ListAgentsModule`

`src/components/ArtificialIntelligence/ListAgents/list-agents.module.ts`

| classe                 | injeta                      | fornecido por                     |
| ---------------------- | --------------------------- | --------------------------------- |
| `ListAgentsService`    | `AgentRepository`           | `AgentRepositoryModule`           |
| `ListAgentsService`    | `AgentConnectionRepository` | `AgentConnectionRepositoryModule` |
| `ListAgentsController` | `ListAgentsService`         | próprio módulo                    |
| `AuthGuard`            | `Reflector`                 | global (Nest/TypeORM)             |

**imports:** `AgentConnectionRepositoryModule`, `AgentRepositoryModule`

#### `LoadAgentSitesModule`

`src/components/ArtificialIntelligence/LoadAgentSites/load-agent-sites.module.ts`

| classe                     | injeta                  | fornecido por            |
| -------------------------- | ----------------------- | ------------------------ |
| `LoadAgentSitesService`    | `SPIDER_SERVICE`        | `SpiderProviderModule`   |
| `LoadAgentSitesService`    | `SUPABASE_SERVICE`      | `SupabaseProviderModule` |
| `LoadAgentSitesController` | `LoadAgentSitesService` | próprio módulo           |
| `AuthGuard`                | `Reflector`             | global (Nest/TypeORM)    |

**imports:** `SpiderProviderModule`, `SupabaseProviderModule`

#### `LoadCheckpointerModule`

`src/components/ArtificialIntelligence/LoadCheckpointer/load-checkpointer.module.ts`

| classe | injeta                      | fornecido por |
| ------ | --------------------------- | ------------- |
| —      | nenhuma dependência externa | —             |

**imports:** —

#### `LoadVectorStoreModule`

`src/components/ArtificialIntelligence/LoadVectorStore/load-vector-store.module.ts`

| classe                   | injeta              | fornecido por                    |
| ------------------------ | ------------------- | -------------------------------- |
| `LoadVectorStoreService` | `VOYAGE_EMBEDDINGS` | `VoyageEmbeddingsProviderModule` |
| `LoadVectorStoreService` | `SUPABASE_CLIENT`   | `SupabaseProviderModule`         |

**imports:** `SupabaseProviderModule`, `VoyageEmbeddingsProviderModule`

#### `NormalizePromptInstructionsModule`

`src/components/ArtificialIntelligence/NormalizePromptInstructions/normalize-prompt-instructions.module.ts`

| classe | injeta                      | fornecido por |
| ------ | --------------------------- | ------------- |
| —      | nenhuma dependência externa | —             |

**imports:** —

#### `ResolveAgentModule`

`src/components/ArtificialIntelligence/ResolveAgent/resolve-agent.module.ts`

| classe                | injeta                       | fornecido por                      |
| --------------------- | ---------------------------- | ---------------------------------- |
| `ResolveAgentService` | `AgentRepository`            | `AgentRepositoryModule`            |
| `ResolveAgentService` | `AgentInstructionRepository` | `AgentInstructionRepositoryModule` |
| `ResolveAgentService` | `BuildSystemPromptService`   | `BuildSystemPromptModule`          |
| `ResolveAgentService` | `LoadCheckpointerService`    | `LoadCheckpointerModule`           |
| `ResolveAgentService` | `LoadAgentToolsService`      | `LoadAgentToolsModule`             |

**imports:** `AgentInstructionRepositoryModule`, `AgentRepositoryModule`, `BuildSystemPromptModule`, `LoadAgentToolsModule`, `LoadCheckpointerModule`

#### `UpdateAgentModule`

`src/components/ArtificialIntelligence/UpdateAgent/update-agent.module.ts`

| classe                  | injeta                       | fornecido por                      |
| ----------------------- | ---------------------------- | ---------------------------------- |
| `UpdateAgentService`    | `AgentRepository`            | `AgentRepositoryModule`            |
| `UpdateAgentService`    | `AgentInstructionRepository` | `AgentInstructionRepositoryModule` |
| `UpdateAgentService`    | `AgentConnectionRepository`  | `AgentConnectionRepositoryModule`  |
| `UpdateAgentController` | `UpdateAgentService`         | próprio módulo                     |
| `AuthGuard`             | `Reflector`                  | global (Nest/TypeORM)              |
| `OrgRoleGuard`          | `Reflector`                  | global (Nest/TypeORM)              |

**imports:** `AgentConnectionRepositoryModule`, `AgentInstructionRepositoryModule`, `AgentRepositoryModule`

### Auth

Agregador `AuthModule` (`src/components/Auth/auth.module.ts`) importa: `GenerateTokenModule`, `LoginModule`, `SendSmsModule`, `CheckUserRegisteredModule`, `RegisterLiteModule`. Sem `exports`.

#### `CheckUserRegisteredModule`

`src/components/Auth/CheckUserRegistered/check-user-registered.module.ts`

| classe                          | injeta                       | fornecido por          |
| ------------------------------- | ---------------------------- | ---------------------- |
| `CheckUserRegisteredService`    | `UserRepository`             | `UserRepositoryModule` |
| `CheckUserRegisteredController` | `CheckUserRegisteredService` | próprio módulo         |

**imports:** `UserRepositoryModule`

#### `GenerateTokenModule`

`src/components/Auth/GenerateToken/generate-token.module.ts`

| classe                 | injeta                | fornecido por               |
| ---------------------- | --------------------- | --------------------------- |
| `GenerateTokenService` | `JwtService`          | próprio módulo              |
| `GenerateTokenService` | `ConfigService`       | **não resolvido**           |
| `GenerateTokenService` | `UserTokenRepository` | `UserTokenRepositoryModule` |

**imports:** `ConfigModule`, `UserTokenRepositoryModule`

#### `LoginModule`

`src/components/Auth/Login/login.module.ts`

| classe            | injeta                 | fornecido por          |
| ----------------- | ---------------------- | ---------------------- |
| `LoginService`    | `UserRepository`       | `UserRepositoryModule` |
| `LoginService`    | `GenerateTokenService` | `GenerateTokenModule`  |
| `LoginController` | `LoginService`         | próprio módulo         |

**imports:** `GenerateTokenModule`, `UserRepositoryModule`

#### `RegisterLiteModule`

`src/components/Auth/RegisterLite/register-lite.module.ts`

| classe                   | injeta                | fornecido por          |
| ------------------------ | --------------------- | ---------------------- |
| `RegisterLiteService`    | `UserRepository`      | `UserRepositoryModule` |
| `RegisterLiteController` | `RegisterLiteService` | próprio módulo         |

**imports:** `UserRepositoryModule`

#### `SendSmsModule`

`src/components/Auth/SendSms/send-sms.module.ts`

| classe              | injeta                      | fornecido por                     |
| ------------------- | --------------------------- | --------------------------------- |
| `SendSmsService`    | `TWILIO_SERVICE`            | `TwilioProviderModule`            |
| `SendSmsService`    | `SmsVerificationRepository` | `SmsVerificationRepositoryModule` |
| `SendSmsService`    | `UserRepository`            | `UserRepositoryModule`            |
| `SendSmsService`    | `GenerateTokenService`      | `GenerateTokenModule`             |
| `SendSmsController` | `SendSmsService`            | próprio módulo                    |

**imports:** `GenerateTokenModule`, `SmsVerificationRepositoryModule`, `TwilioProviderModule`, `UserRepositoryModule`

### Credits

Agregador `CreditsModule` (`src/components/Credits/credits.module.ts`) importa: `ManageCreditsModule`. Sem `exports`.

#### `ManageCreditsModule`

`src/components/Credits/ManageCredits/manage-credits.module.ts`

| classe                 | injeta                        | fornecido por                       |
| ---------------------- | ----------------------------- | ----------------------------------- |
| `ManageCreditsService` | `CreditBalanceRepository`     | `CreditBalanceRepositoryModule`     |
| `ManageCreditsService` | `CreditTransactionRepository` | `CreditTransactionRepositoryModule` |

**imports:** `CreditBalanceRepositoryModule`, `CreditTransactionRepositoryModule`

### Dashboard

Agregador `DashboardModule` (`src/components/Dashboard/dashboard.module.ts`) importa: `DashboardStatisticsModule`, `DashboardChartsModule`. Sem `exports`.

#### `DashboardChartsModule`

`src/components/Dashboard/Charts/dashboard-charts.module.ts`

| classe                      | injeta                   | fornecido por                |
| --------------------------- | ------------------------ | ---------------------------- |
| `DashboardChartsService`    | `SessionRepository`      | `SessionRepositoryModule`    |
| `DashboardChartsService`    | `MessageRepository`      | `MessageRepositoryModule`    |
| `DashboardChartsService`    | `ReportRepository`       | `ReportRepositoryModule`     |
| `DashboardChartsService`    | `TokenUsageRepository`   | `TokenUsageRepositoryModule` |
| `DashboardChartsController` | `DashboardChartsService` | próprio módulo               |
| `AuthGuard`                 | `Reflector`              | global (Nest/TypeORM)        |

**imports:** `MessageRepositoryModule`, `ReportRepositoryModule`, `SessionRepositoryModule`, `TokenUsageRepositoryModule`

#### `DashboardStatisticsModule`

`src/components/Dashboard/Statistics/dashboard-statistics.module.ts`

| classe                          | injeta                       | fornecido por                |
| ------------------------------- | ---------------------------- | ---------------------------- |
| `DashboardStatisticsService`    | `SessionRepository`          | `SessionRepositoryModule`    |
| `DashboardStatisticsService`    | `MessageRepository`          | `MessageRepositoryModule`    |
| `DashboardStatisticsService`    | `AgentRepository`            | `AgentRepositoryModule`      |
| `DashboardStatisticsService`    | `ReportRepository`           | `ReportRepositoryModule`     |
| `DashboardStatisticsService`    | `TokenUsageRepository`       | `TokenUsageRepositoryModule` |
| `DashboardStatisticsController` | `DashboardStatisticsService` | próprio módulo               |
| `AuthGuard`                     | `Reflector`                  | global (Nest/TypeORM)        |

**imports:** `AgentRepositoryModule`, `MessageRepositoryModule`, `ReportRepositoryModule`, `SessionRepositoryModule`, `TokenUsageRepositoryModule`

### Email

#### `EmailModule`

`src/components/Email/email.module.ts`

| classe         | injeta          | fornecido por            |
| -------------- | --------------- | ------------------------ |
| `EmailService` | `EMAIL_SERVICE` | `SendGridProviderModule` |

**imports:** `SendGridProviderModule`

### OCR

Agregador `OcrModule` (`src/components/OCR/ocr.module.ts`) importa: `ExtractOcrTextModule`. Sem `exports`.

#### `ExtractOcrTextModule`

`src/components/OCR/ExtractOcrText/extract-ocr-text.module.ts`

| classe                  | injeta                      | fornecido por              |
| ----------------------- | --------------------------- | -------------------------- |
| `ExtractOcrTextService` | `ImageAnnotatorClient`      | próprio módulo             |
| `ExtractOcrTextService` | `GenerateAiResponseService` | `GenerateAiResponseModule` |
| `ExtractOcrTextService` | `ResolveAgentService`       | `ResolveAgentModule`       |

**imports:** `GenerateAiResponseModule`, `ResolveAgentModule`

### Organization

Agregador `MembersModule` (`src/components/Organization/Members/members.module.ts`) importa: `InviteMemberModule`, `AcceptInviteModule`, `ListMembersModule`, `UpdateMemberRoleModule`, `RemoveMemberModule`. Sem `exports`.

Agregador `OrganizationModule` (`src/components/Organization/organization.module.ts`) importa: `CreateOrganizationModule`, `ListOrganizationsModule`, `GetOrganizationModule`, `GetEmbedSettingsModule`, `UpdateEmbedSettingsModule`, `RegenerateEmbedTokenModule`, `PublicEmbedModule`, `ActivateOrganizationModule`, `DeactivateOrganizationModule`, `MembersModule`. Sem `exports`.

#### `AcceptInviteModule`

`src/components/Organization/Members/AcceptInvite/accept-invite.module.ts`

| classe                   | injeta                | fornecido por          |
| ------------------------ | --------------------- | ---------------------- |
| `AcceptInviteService`    | `UserRepository`      | `UserRepositoryModule` |
| `AcceptInviteController` | `AcceptInviteService` | próprio módulo         |

**imports:** `UserRepositoryModule`

#### `ActivateOrganizationModule`

`src/components/Organization/ActivateOrganization/activate-organization.module.ts`

| classe                        | injeta                   | fornecido por                  |
| ----------------------------- | ------------------------ | ------------------------------ |
| `ActivateOrganizationService` | `OrganizationRepository` | `OrganizationRepositoryModule` |

**imports:** `OrganizationRepositoryModule`

#### `CreateOrganizationModule`

`src/components/Organization/CreateOrganization/create-organization.module.ts`

| classe                         | injeta                      | fornecido por                  |
| ------------------------------ | --------------------------- | ------------------------------ |
| `CreateOrganizationService`    | `OrganizationRepository`    | `OrganizationRepositoryModule` |
| `CreateOrganizationService`    | `PlanRepository`            | `PlanRepositoryModule`         |
| `CreateOrganizationService`    | `ManageCreditsService`      | `ManageCreditsModule`          |
| `CreateOrganizationService`    | `UserRepository`            | `UserRepositoryModule`         |
| `CreateOrganizationController` | `CreateOrganizationService` | próprio módulo                 |
| `AuthGuard`                    | `Reflector`                 | global (Nest/TypeORM)          |

**imports:** `ManageCreditsModule`, `OrganizationRepositoryModule`, `PlanRepositoryModule`, `UserRepositoryModule`

#### `DeactivateOrganizationModule`

`src/components/Organization/DeactivateOrganization/deactivate-organization.module.ts`

| classe                          | injeta                   | fornecido por                  |
| ------------------------------- | ------------------------ | ------------------------------ |
| `DeactivateOrganizationService` | `OrganizationRepository` | `OrganizationRepositoryModule` |

**imports:** `OrganizationRepositoryModule`

#### `GetEmbedSettingsModule`

`src/components/Organization/GetEmbedSettings/get-embed-settings.module.ts`

| classe                       | injeta                    | fornecido por                  |
| ---------------------------- | ------------------------- | ------------------------------ |
| `GetEmbedSettingsService`    | `OrganizationRepository`  | `OrganizationRepositoryModule` |
| `GetEmbedSettingsController` | `GetEmbedSettingsService` | próprio módulo                 |
| `AuthGuard`                  | `Reflector`               | global (Nest/TypeORM)          |

**imports:** `OrganizationRepositoryModule`

#### `GetOrganizationModule`

`src/components/Organization/GetOrganization/get-organization.module.ts`

| classe                      | injeta                   | fornecido por                  |
| --------------------------- | ------------------------ | ------------------------------ |
| `GetOrganizationService`    | `OrganizationRepository` | `OrganizationRepositoryModule` |
| `GetOrganizationController` | `GetOrganizationService` | próprio módulo                 |
| `AuthGuard`                 | `Reflector`              | global (Nest/TypeORM)          |

**imports:** `OrganizationRepositoryModule`

#### `InviteMemberModule`

`src/components/Organization/Members/InviteMember/invite-member.module.ts`

| classe                   | injeta                   | fornecido por                  |
| ------------------------ | ------------------------ | ------------------------------ |
| `InviteMemberService`    | `UserRepository`         | `UserRepositoryModule`         |
| `InviteMemberService`    | `OrganizationRepository` | `OrganizationRepositoryModule` |
| `InviteMemberService`    | `EmailService`           | `EmailModule`                  |
| `InviteMemberController` | `InviteMemberService`    | próprio módulo                 |
| `AuthGuard`              | `Reflector`              | global (Nest/TypeORM)          |
| `OrgRoleGuard`           | `Reflector`              | global (Nest/TypeORM)          |

**imports:** `EmailModule`, `OrganizationRepositoryModule`, `UserRepositoryModule`

#### `ListMembersModule`

`src/components/Organization/Members/ListMembers/list-members.module.ts`

| classe                  | injeta               | fornecido por          |
| ----------------------- | -------------------- | ---------------------- |
| `ListMembersService`    | `UserRepository`     | `UserRepositoryModule` |
| `ListMembersController` | `ListMembersService` | próprio módulo         |
| `AuthGuard`             | `Reflector`          | global (Nest/TypeORM)  |
| `OrgRoleGuard`          | `Reflector`          | global (Nest/TypeORM)  |

**imports:** `UserRepositoryModule`

#### `ListOrganizationsModule`

`src/components/Organization/ListOrganizations/list-organizations.module.ts`

| classe                        | injeta                     | fornecido por                  |
| ----------------------------- | -------------------------- | ------------------------------ |
| `ListOrganizationsService`    | `OrganizationRepository`   | `OrganizationRepositoryModule` |
| `ListOrganizationsController` | `ListOrganizationsService` | próprio módulo                 |
| `AuthGuard`                   | `Reflector`                | global (Nest/TypeORM)          |

**imports:** `OrganizationRepositoryModule`

#### `PublicEmbedModule`

`src/components/Organization/PublicEmbed/public-embed.module.ts`

| classe                  | injeta               | fornecido por  |
| ----------------------- | -------------------- | -------------- |
| `PublicEmbedController` | `PublicEmbedService` | próprio módulo |

**imports:** —

#### `RegenerateEmbedTokenModule`

`src/components/Organization/RegenerateEmbedToken/regenerate-embed-token.module.ts`

| classe                           | injeta                        | fornecido por                  |
| -------------------------------- | ----------------------------- | ------------------------------ |
| `RegenerateEmbedTokenService`    | `OrganizationRepository`      | `OrganizationRepositoryModule` |
| `RegenerateEmbedTokenController` | `RegenerateEmbedTokenService` | próprio módulo                 |
| `AuthGuard`                      | `Reflector`                   | global (Nest/TypeORM)          |

**imports:** `OrganizationRepositoryModule`

#### `RemoveMemberModule`

`src/components/Organization/Members/RemoveMember/remove-member.module.ts`

| classe                   | injeta                | fornecido por          |
| ------------------------ | --------------------- | ---------------------- |
| `RemoveMemberService`    | `UserRepository`      | `UserRepositoryModule` |
| `RemoveMemberController` | `RemoveMemberService` | próprio módulo         |
| `AuthGuard`              | `Reflector`           | global (Nest/TypeORM)  |
| `OrgRoleGuard`           | `Reflector`           | global (Nest/TypeORM)  |

**imports:** `UserRepositoryModule`

#### `UpdateEmbedSettingsModule`

`src/components/Organization/UpdateEmbedSettings/update-embed-settings.module.ts`

| classe                          | injeta                       | fornecido por                  |
| ------------------------------- | ---------------------------- | ------------------------------ |
| `UpdateEmbedSettingsService`    | `OrganizationRepository`     | `OrganizationRepositoryModule` |
| `UpdateEmbedSettingsController` | `UpdateEmbedSettingsService` | próprio módulo                 |
| `AuthGuard`                     | `Reflector`                  | global (Nest/TypeORM)          |

**imports:** `OrganizationRepositoryModule`

#### `UpdateMemberRoleModule`

`src/components/Organization/Members/UpdateMemberRole/update-member-role.module.ts`

| classe                       | injeta                    | fornecido por          |
| ---------------------------- | ------------------------- | ---------------------- |
| `UpdateMemberRoleService`    | `UserRepository`          | `UserRepositoryModule` |
| `UpdateMemberRoleController` | `UpdateMemberRoleService` | próprio módulo         |
| `AuthGuard`                  | `Reflector`               | global (Nest/TypeORM)  |
| `OrgRoleGuard`               | `Reflector`               | global (Nest/TypeORM)  |

**imports:** `UserRepositoryModule`

### Payment

Agregador `PaymentModule` (`src/components/Payment/payment.module.ts`) importa: `CreateCheckoutModule`, `StripeWebhookModule`, `GetPlansModule`, `GetCreditsModule`, `GetPaymentHistoryModule`, `GetCreditTransactionsModule`, `GetStripePublicKeyModule`. Sem `exports`.

#### `CreateCheckoutModule`

`src/components/Payment/CreateCheckout/create-checkout.module.ts`

| classe                     | injeta                   | fornecido por                  |
| -------------------------- | ------------------------ | ------------------------------ |
| `CreateCheckoutService`    | `STRIPE_CLIENT`          | `StripeProviderModule`         |
| `CreateCheckoutService`    | `OrganizationRepository` | `OrganizationRepositoryModule` |
| `CreateCheckoutService`    | `PlanRepository`         | `PlanRepositoryModule`         |
| `CreateCheckoutService`    | `PaymentRepository`      | `PaymentRepositoryModule`      |
| `CreateCheckoutController` | `CreateCheckoutService`  | próprio módulo                 |
| `AuthGuard`                | `Reflector`              | global (Nest/TypeORM)          |

**imports:** `OrganizationRepositoryModule`, `PaymentRepositoryModule`, `PlanRepositoryModule`, `StripeProviderModule`

#### `GetCreditsModule`

`src/components/Payment/GetCredits/get-credits.module.ts`

| classe                 | injeta                    | fornecido por                   |
| ---------------------- | ------------------------- | ------------------------------- |
| `GetCreditsService`    | `CreditBalanceRepository` | `CreditBalanceRepositoryModule` |
| `GetCreditsController` | `GetCreditsService`       | próprio módulo                  |
| `AuthGuard`            | `Reflector`               | global (Nest/TypeORM)           |

**imports:** `CreditBalanceRepositoryModule`

#### `GetCreditTransactionsModule`

`src/components/Payment/GetCreditTransactions/get-credit-transactions.module.ts`

| classe                            | injeta                         | fornecido por                       |
| --------------------------------- | ------------------------------ | ----------------------------------- |
| `GetCreditTransactionsService`    | `CreditTransactionRepository`  | `CreditTransactionRepositoryModule` |
| `GetCreditTransactionsController` | `GetCreditTransactionsService` | próprio módulo                      |
| `AuthGuard`                       | `Reflector`                    | global (Nest/TypeORM)               |

**imports:** `CreditTransactionRepositoryModule`

#### `GetPaymentHistoryModule`

`src/components/Payment/GetPaymentHistory/get-payment-history.module.ts`

| classe                        | injeta                     | fornecido por             |
| ----------------------------- | -------------------------- | ------------------------- |
| `GetPaymentHistoryService`    | `PaymentRepository`        | `PaymentRepositoryModule` |
| `GetPaymentHistoryController` | `GetPaymentHistoryService` | próprio módulo            |
| `AuthGuard`                   | `Reflector`                | global (Nest/TypeORM)     |

**imports:** `PaymentRepositoryModule`

#### `GetPlansModule`

`src/components/Payment/GetPlans/get-plans.module.ts`

| classe               | injeta            | fornecido por          |
| -------------------- | ----------------- | ---------------------- |
| `GetPlansService`    | `PlanRepository`  | `PlanRepositoryModule` |
| `GetPlansController` | `GetPlansService` | próprio módulo         |

**imports:** `PlanRepositoryModule`

#### `GetStripePublicKeyModule`

`src/components/Payment/GetStripePublicKey/get-stripe-public-key.module.ts`

| classe                         | injeta                      | fornecido por  |
| ------------------------------ | --------------------------- | -------------- |
| `GetStripePublicKeyController` | `GetStripePublicKeyService` | próprio módulo |

**imports:** —

#### `StripeWebhookModule`

`src/components/Payment/StripeWebhook/stripe-webhook.module.ts`

| classe                    | injeta                          | fornecido por                  |
| ------------------------- | ------------------------------- | ------------------------------ |
| `StripeWebhookService`    | `STRIPE_CLIENT`                 | `StripeProviderModule`         |
| `StripeWebhookService`    | `PaymentRepository`             | `PaymentRepositoryModule`      |
| `StripeWebhookService`    | `ManageCreditsService`          | `ManageCreditsModule`          |
| `StripeWebhookService`    | `ActivateOrganizationService`   | `ActivateOrganizationModule`   |
| `StripeWebhookService`    | `DeactivateOrganizationService` | `DeactivateOrganizationModule` |
| `StripeWebhookController` | `StripeWebhookService`          | próprio módulo                 |

**imports:** `ActivateOrganizationModule`, `DeactivateOrganizationModule`, `ManageCreditsModule`, `PaymentRepositoryModule`, `StripeProviderModule`

### Pdf

Agregador `PdfModule` (`src/components/Pdf/pdf.module.ts`) importa: `LoadPdfModule`, `ProcessPdfModule`, `ExtractPdfChunksModule`. Sem `exports`.

#### `ExtractPdfChunksModule`

`src/components/Pdf/ExtractPdfChunks/extract-pdf-chunks.module.ts`

| classe | injeta                      | fornecido por |
| ------ | --------------------------- | ------------- |
| —      | nenhuma dependência externa | —             |

**imports:** —

#### `LoadPdfModule`

`src/components/Pdf/LoadPdf/load-pdf.module.ts`

| classe           | injeta              | fornecido por      |
| ---------------- | ------------------- | ------------------ |
| `LoadPdfService` | `ProcessPdfService` | `ProcessPdfModule` |

**imports:** `ProcessPdfModule`

#### `ProcessPdfModule`

`src/components/Pdf/ProcessPdf/process-pdf.module.ts`

| classe              | injeta                    | fornecido por            |
| ------------------- | ------------------------- | ------------------------ |
| `ProcessPdfService` | `ExtractPdfChunksService` | `ExtractPdfChunksModule` |

**imports:** `ExtractPdfChunksModule`

### Register

Agregador `RegisterModule` (`src/components/Register/register.module.ts`) importa: `SignUpModule`. Sem `exports`.

#### `SignUpModule`

`src/components/Register/SignUp/sign-up.module.ts`

| classe             | injeta           | fornecido por          |
| ------------------ | ---------------- | ---------------------- |
| `SignUpService`    | `UserRepository` | `UserRepositoryModule` |
| `SignUpController` | `SignUpService`  | próprio módulo         |

**imports:** `UserRepositoryModule`

### Report

Agregador `ReportModule` (`src/components/Report/report.module.ts`) importa: `ListReportsModule`, `GetReportModule`, `GetReportConversationModule`. Sem `exports`.

#### `GetReportConversationModule`

`src/components/Report/GetReportConversation/get-report-conversation.module.ts`

| classe                            | injeta                         | fornecido por              |
| --------------------------------- | ------------------------------ | -------------------------- |
| `GetReportConversationService`    | `ReportRepository`             | `ReportRepositoryModule`   |
| `GetReportConversationService`    | `GetSessionMessagesService`    | `GetSessionMessagesModule` |
| `GetReportConversationController` | `GetReportConversationService` | próprio módulo             |
| `AuthGuard`                       | `Reflector`                    | global (Nest/TypeORM)      |

**imports:** `GetSessionMessagesModule`, `ReportRepositoryModule`

#### `GetReportModule`

`src/components/Report/GetReport/get-report.module.ts`

| classe                | injeta             | fornecido por            |
| --------------------- | ------------------ | ------------------------ |
| `GetReportService`    | `ReportRepository` | `ReportRepositoryModule` |
| `GetReportController` | `GetReportService` | próprio módulo           |
| `AuthGuard`           | `Reflector`        | global (Nest/TypeORM)    |

**imports:** `ReportRepositoryModule`

#### `ListReportsModule`

`src/components/Report/ListReports/list-reports.module.ts`

| classe                  | injeta               | fornecido por            |
| ----------------------- | -------------------- | ------------------------ |
| `ListReportsService`    | `ReportRepository`   | `ReportRepositoryModule` |
| `ListReportsController` | `ListReportsService` | próprio módulo           |
| `AuthGuard`             | `Reflector`          | global (Nest/TypeORM)    |

**imports:** `ReportRepositoryModule`

### Session

Agregador `SessionModule` (`src/components/Session/session.module.ts`) importa: `CreateSessionIfNotExistsModule`, `ListSessionsModule`, `GetSessionMessagesModule`. Sem `exports`.

#### `CreateSessionIfNotExistsModule`

`src/components/Session/CreateSessionIfNotExists/create-session-if-not-exists.module.ts`

| classe                               | injeta                            | fornecido por             |
| ------------------------------------ | --------------------------------- | ------------------------- |
| `CreateSessionIfNotExistsService`    | `SessionRepository`               | `SessionRepositoryModule` |
| `CreateSessionIfNotExistsController` | `CreateSessionIfNotExistsService` | próprio módulo            |
| `AuthGuard`                          | `Reflector`                       | global (Nest/TypeORM)     |

**imports:** `SessionRepositoryModule`

#### `GetSessionMessagesModule`

`src/components/Session/GetSessionMessages/get-session-messages.module.ts`

| classe                         | injeta                        | fornecido por                       |
| ------------------------------ | ----------------------------- | ----------------------------------- |
| `GetSessionMessagesService`    | `SessionRepository`           | `SessionRepositoryModule`           |
| `GetSessionMessagesService`    | `MessageRepository`           | `MessageRepositoryModule`           |
| `GetSessionMessagesService`    | `CreditTransactionRepository` | `CreditTransactionRepositoryModule` |
| `GetSessionMessagesService`    | `AgentRepository`             | `AgentRepositoryModule`             |
| `GetSessionMessagesService`    | `UserRepository`              | `UserRepositoryModule`              |
| `GetSessionMessagesController` | `GetSessionMessagesService`   | próprio módulo                      |
| `AuthGuard`                    | `Reflector`                   | global (Nest/TypeORM)               |
| `ActiveOrgGuard`               | `DataSource`                  | global (Nest/TypeORM)               |

**imports:** `AgentRepositoryModule`, `CreditTransactionRepositoryModule`, `MessageRepositoryModule`, `SessionRepositoryModule`, `UserRepositoryModule`

#### `ListSessionsModule`

`src/components/Session/ListSessions/list-sessions.module.ts`

| classe                   | injeta                | fornecido por             |
| ------------------------ | --------------------- | ------------------------- |
| `ListSessionsService`    | `SessionRepository`   | `SessionRepositoryModule` |
| `ListSessionsController` | `ListSessionsService` | próprio módulo            |
| `AuthGuard`              | `Reflector`           | global (Nest/TypeORM)     |
| `ActiveOrgGuard`         | `DataSource`          | global (Nest/TypeORM)     |

**imports:** `SessionRepositoryModule`

### Source

Agregador `SourceModule` (`src/components/Source/source.module.ts`) importa: `ListSourcesModule`, `GetSourceModule`, `DeleteSourceModule`, `GenerateAgentSourceModule`. Sem `exports`.

#### `DeleteSourceModule`

`src/components/Source/DeleteSource/delete-source.module.ts`

| classe                   | injeta                | fornecido por            |
| ------------------------ | --------------------- | ------------------------ |
| `DeleteSourceService`    | `SourceRepository`    | `SourceRepositoryModule` |
| `DeleteSourceService`    | `SUPABASE_CLIENT`     | `SupabaseProviderModule` |
| `DeleteSourceController` | `DeleteSourceService` | próprio módulo           |
| `AuthGuard`              | `Reflector`           | global (Nest/TypeORM)    |

**imports:** `SourceRepositoryModule`, `SupabaseProviderModule`

#### `GenerateAgentSourceModule`

`src/components/Source/GenerateAgentSource/generate-agent-source.module.ts`

| classe                          | injeta                       | fornecido por              |
| ------------------------------- | ---------------------------- | -------------------------- |
| `GenerateAgentSourceService`    | `ResolveSourceAgentService`  | `ResolveSourceAgentModule` |
| `GenerateAgentSourceService`    | `ProcessPdfSourceService`    | `ProcessPdfSourceModule`   |
| `GenerateAgentSourceService`    | `ProcessTextSourceService`   | `ProcessTextSourceModule`  |
| `GenerateAgentSourceService`    | `ProcessDocxSourceService`   | `ProcessDocxSourceModule`  |
| `GenerateAgentSourceService`    | `LoadAgentSitesService`      | próprio módulo             |
| `GenerateAgentSourceService`    | `AgentRepository`            | `AgentRepositoryModule`    |
| `GenerateAgentSourceService`    | `SourceRepository`           | `SourceRepositoryModule`   |
| `LoadAgentSitesService`         | `SPIDER_SERVICE`             | `SpiderProviderModule`     |
| `LoadAgentSitesService`         | `SUPABASE_SERVICE`           | `SupabaseProviderModule`   |
| `GenerateAgentSourceController` | `GenerateAgentSourceService` | próprio módulo             |

**imports:** `AgentRepositoryModule`, `ProcessDocxSourceModule`, `ProcessPdfSourceModule`, `ProcessTextSourceModule`, `ResolveSourceAgentModule`, `SourceRepositoryModule`, `SpiderProviderModule`, `SupabaseProviderModule`

#### `GetSourceModule`

`src/components/Source/GetSource/get-source.module.ts`

| classe                | injeta             | fornecido por            |
| --------------------- | ------------------ | ------------------------ |
| `GetSourceService`    | `SourceRepository` | `SourceRepositoryModule` |
| `GetSourceController` | `GetSourceService` | próprio módulo           |
| `AuthGuard`           | `Reflector`        | global (Nest/TypeORM)    |

**imports:** `SourceRepositoryModule`

#### `ListSourcesModule`

`src/components/Source/ListSources/list-sources.module.ts`

| classe                  | injeta               | fornecido por            |
| ----------------------- | -------------------- | ------------------------ |
| `ListSourcesService`    | `SourceRepository`   | `SourceRepositoryModule` |
| `ListSourcesController` | `ListSourcesService` | próprio módulo           |
| `AuthGuard`             | `Reflector`          | global (Nest/TypeORM)    |

**imports:** `SourceRepositoryModule`

#### `ProcessDocxSourceModule`

`src/components/Source/ProcessDocxSource/process-docx-source.module.ts`

| classe                     | injeta             | fornecido por            |
| -------------------------- | ------------------ | ------------------------ |
| `ProcessDocxSourceService` | `SUPABASE_SERVICE` | `SupabaseProviderModule` |

**imports:** `SupabaseProviderModule`

#### `ProcessPdfSourceModule`

`src/components/Source/ProcessPdfSource/process-pdf-source.module.ts`

| classe                    | injeta             | fornecido por            |
| ------------------------- | ------------------ | ------------------------ |
| `ProcessPdfSourceService` | `LoadPdfService`   | `LoadPdfModule`          |
| `ProcessPdfSourceService` | `SUPABASE_SERVICE` | `SupabaseProviderModule` |

**imports:** `LoadPdfModule`, `SupabaseProviderModule`

#### `ProcessTextSourceModule`

`src/components/Source/ProcessTextSource/process-text-source.module.ts`

| classe                     | injeta             | fornecido por            |
| -------------------------- | ------------------ | ------------------------ |
| `ProcessTextSourceService` | `SUPABASE_SERVICE` | `SupabaseProviderModule` |

**imports:** `SupabaseProviderModule`

#### `ResolveSourceAgentModule`

`src/components/Source/ResolveSourceAgent/resolve-source-agent.module.ts`

| classe                      | injeta            | fornecido por           |
| --------------------------- | ----------------- | ----------------------- |
| `ResolveSourceAgentService` | `AgentRepository` | `AgentRepositoryModule` |

**imports:** `AgentRepositoryModule`

### TokenUsage

Agregador `TokenUsageModule` (`src/components/TokenUsage/token-usage.module.ts`) importa: `GetTokenUsageModule`, `RecordTokenUsageModule`. Sem `exports`.

#### `GetTokenUsageModule`

`src/components/TokenUsage/GetTokenUsage/get-token-usage.module.ts`

| classe                    | injeta                 | fornecido por                |
| ------------------------- | ---------------------- | ---------------------------- |
| `GetTokenUsageService`    | `TokenUsageRepository` | `TokenUsageRepositoryModule` |
| `GetTokenUsageController` | `GetTokenUsageService` | próprio módulo               |
| `AuthGuard`               | `Reflector`            | global (Nest/TypeORM)        |

**imports:** `TokenUsageRepositoryModule`

#### `RecordTokenUsageModule`

`src/components/TokenUsage/RecordTokenUsage/record-token-usage.module.ts`

| classe                    | injeta                 | fornecido por                |
| ------------------------- | ---------------------- | ---------------------------- |
| `RecordTokenUsageService` | `TokenUsageRepository` | `TokenUsageRepositoryModule` |

**imports:** `TokenUsageRepositoryModule`

### Tools

#### `LoadAgentToolsModule`

`src/components/Tools/LoadAgentTools/load-agent-tools.module.ts`

| classe                  | injeta                         | fornecido por                 |
| ----------------------- | ------------------------------ | ----------------------------- |
| `LoadAgentToolsService` | `AppendConnectionToolsService` | `AppendConnectionToolsModule` |
| `LoadAgentToolsService` | `LoadVectorSearchToolService`  | `LoadVectorSearchToolModule`  |
| `LoadAgentToolsService` | `MaybeLoadDatabaseToolService` | `MaybeLoadDatabaseToolModule` |

**imports:** `AppendConnectionToolsModule`, `LoadVectorSearchToolModule`, `MaybeLoadDatabaseToolModule`

#### `LoadDatabaseToolModule`

`src/components/Tools/LoadDatabaseTool/load-database-tool.module.ts`

| classe | injeta                      | fornecido por |
| ------ | --------------------------- | ------------- |
| —      | nenhuma dependência externa | —             |

**imports:** —

#### `LoadVectorSearchToolModule`

`src/components/Tools/LoadVectorSearchTool/load-vector-search-tool.module.ts`

| classe                        | injeta                           | fornecido por                   |
| ----------------------------- | -------------------------------- | ------------------------------- |
| `LoadVectorSearchToolService` | `LoadVectorStoreService`         | `LoadVectorStoreModule`         |
| `LoadVectorSearchToolService` | `ExecuteSimilaritySearchService` | `ExecuteSimilaritySearchModule` |

**imports:** `ExecuteSimilaritySearchModule`, `LoadVectorStoreModule`

#### `MaybeLoadDatabaseToolModule`

`src/components/Tools/MaybeLoadDatabaseTool/maybe-load-database-tool.module.ts`

| classe                         | injeta                          | fornecido por                         |
| ------------------------------ | ------------------------------- | ------------------------------------- |
| `MaybeLoadDatabaseToolService` | `LoadDatabaseToolService`       | `LoadDatabaseToolModule`              |
| `MaybeLoadDatabaseToolService` | `OrganizationFeatureRepository` | `OrganizationFeatureRepositoryModule` |
| `MaybeLoadDatabaseToolService` | `OrganizationRepository`        | `OrganizationRepositoryModule`        |

**imports:** `LoadDatabaseToolModule`, `OrganizationFeatureRepositoryModule`, `OrganizationRepositoryModule`

### User

Agregador `UserModule` (`src/components/User/user.module.ts`) importa: `ListUsersModule`, `GetUserModule`, `UpdateUserModule`, `CreateUserModule`, `GetProfileModule`, `UpdateProfileModule`. Sem `exports`.

#### `CreateUserModule`

`src/components/User/CreateUser/create-user.module.ts`

| classe                 | injeta              | fornecido por          |
| ---------------------- | ------------------- | ---------------------- |
| `CreateUserService`    | `UserRepository`    | `UserRepositoryModule` |
| `CreateUserController` | `CreateUserService` | próprio módulo         |
| `AuthGuard`            | `Reflector`         | global (Nest/TypeORM)  |

**imports:** `UserRepositoryModule`

#### `GetProfileModule`

`src/components/User/GetProfile/get-profile.module.ts`

| classe                 | injeta              | fornecido por          |
| ---------------------- | ------------------- | ---------------------- |
| `GetProfileService`    | `UserRepository`    | `UserRepositoryModule` |
| `GetProfileController` | `GetProfileService` | próprio módulo         |
| `AuthGuard`            | `Reflector`         | global (Nest/TypeORM)  |

**imports:** `UserRepositoryModule`

#### `GetUserModule`

`src/components/User/GetUser/get-user.module.ts`

| classe              | injeta           | fornecido por          |
| ------------------- | ---------------- | ---------------------- |
| `GetUserService`    | `UserRepository` | `UserRepositoryModule` |
| `GetUserController` | `GetUserService` | próprio módulo         |
| `AuthGuard`         | `Reflector`      | global (Nest/TypeORM)  |

**imports:** `UserRepositoryModule`

#### `ListUsersModule`

`src/components/User/ListUsers/list-users.module.ts`

| classe                | injeta             | fornecido por          |
| --------------------- | ------------------ | ---------------------- |
| `ListUsersService`    | `UserRepository`   | `UserRepositoryModule` |
| `ListUsersController` | `ListUsersService` | próprio módulo         |
| `AuthGuard`           | `Reflector`        | global (Nest/TypeORM)  |

**imports:** `UserRepositoryModule`

#### `UpdateProfileModule`

`src/components/User/UpdateProfile/update-profile.module.ts`

| classe                    | injeta                 | fornecido por          |
| ------------------------- | ---------------------- | ---------------------- |
| `UpdateProfileService`    | `UserRepository`       | `UserRepositoryModule` |
| `UpdateProfileController` | `UpdateProfileService` | próprio módulo         |
| `AuthGuard`               | `Reflector`            | global (Nest/TypeORM)  |

**imports:** `UserRepositoryModule`

#### `UpdateUserModule`

`src/components/User/UpdateUser/update-user.module.ts`

| classe                 | injeta              | fornecido por          |
| ---------------------- | ------------------- | ---------------------- |
| `UpdateUserService`    | `UserRepository`    | `UserRepositoryModule` |
| `UpdateUserController` | `UpdateUserService` | próprio módulo         |
| `AuthGuard`            | `Reflector`         | global (Nest/TypeORM)  |

**imports:** `UserRepositoryModule`

### Whatsapp

Agregador `WhatsappModule` (`src/components/Whatsapp/whatsapp.module.ts`) importa: `WebhookModule`. Sem `exports`.

#### `WebhookModule`

`src/components/Whatsapp/Webhook/webhook.module.ts`

| classe              | injeta           | fornecido por          |
| ------------------- | ---------------- | ---------------------- |
| `WebhookService`    | `TWILIO_SERVICE` | `TwilioProviderModule` |
| `WebhookService`    | `UserRepository` | `UserRepositoryModule` |
| `WebhookController` | `WebhookService` | próprio módulo         |

**imports:** `TwilioProviderModule`, `UserRepositoryModule`

## Verificação

```bash
bun run scripts/refactor-di/analyze.ts     # 0 modules to rewrite = convergido
bun run scripts/refactor-di/verify.ts      # alcançabilidade estática do grafo
TS_NODE_TRANSPILE_ONLY=1 TS_NODE_COMPILER_OPTIONS='{"module":"commonjs","moduleResolution":"node","esModuleInterop":true}' \
  node -r ts-node/register -r tsconfig-paths/register scripts/refactor-di/boot-check.ts   # container Nest completo, sem banco
bun run lint && bun run build
```
