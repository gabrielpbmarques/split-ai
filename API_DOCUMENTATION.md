# Split-AI API Documentation

Documentação completa dos endpoints da API para integração com frontend.

**Base URL**: `{API_URL}`  
**Autenticação**: JWT Bearer Token (`Authorization: Bearer <token>`)

---

## Índice

1. [Health Check](#1-health-check)
2. [Autenticação](#2-autenticação)
3. [Registro](#3-registro)
4. [Usuários](#4-usuários)
5. [Agentes](#5-agentes)
6. [Chat AI](#6-chat-ai)
7. [Sessões](#7-sessões)
8. [Organizações](#8-organizações)
9. [Relatórios](#9-relatórios)
10. [Analytics](#10-analytics)
11. [Sources (Fontes de Conhecimento)](#11-sources)
12. [Token Usage](#12-token-usage)
13. [WhatsApp](#13-whatsapp)
14. [Inteligência Artificial](#14-inteligência-artificial)

---

## 1. Health Check

### GET `/health`

Verifica se a API está funcionando.

| Campo            | Valor   |
| ---------------- | ------- |
| **Acesso**       | Público |
| **Autenticação** | Não     |

**Response (200)**:

```json
{
  "status": "ok"
}
```

---

## 2. Autenticação

### POST `/auth/login`

Realiza login do usuário.

| Campo            | Valor   |
| ---------------- | ------- |
| **Acesso**       | Público |
| **Autenticação** | Não     |

**Request Body**:

```json
{
  "email": "string", // Obrigatório - Email válido
  "password": "string", // Obrigatório
  "deviceFingerprint": "string" // Opcional
}
```

**Response (200)**:

```json
{
  "token": "string",
  "user": { ... }
}
```

---

### POST `/auth/send-sms`

Envia código SMS para verificação.

| Campo            | Valor   |
| ---------------- | ------- |
| **Acesso**       | Público |
| **Autenticação** | Não     |

**Request Body**:

```json
{
  "phone": "string", // Obrigatório - 10-13 dígitos numéricos
  "userId": "string" // Opcional
}
```

---

### POST `/auth/verify-sms`

Verifica código SMS recebido.

| Campo            | Valor   |
| ---------------- | ------- |
| **Acesso**       | Público |
| **Autenticação** | Não     |

**Request Body**:

```json
{
  "phone": "string", // Obrigatório - 10-13 dígitos numéricos
  "code": "string", // Obrigatório - Exatamente 6 dígitos
  "userId": "string" // Obrigatório
}
```

---

### POST `/auth/check-user-registered`

Verifica se usuário está registrado pelo telefone.

| Campo            | Valor   |
| ---------------- | ------- |
| **Acesso**       | Público |
| **Autenticação** | Não     |

**Request Body**:

```json
{
  "phone": "string" // Obrigatório
}
```

**Response (200)**:

```json
{
  "success": true,
  "data": { ... }
}
```

---

### POST `/auth/register-lite`

Registro simplificado de usuário.

| Campo            | Valor   |
| ---------------- | ------- |
| **Acesso**       | Público |
| **Autenticação** | Não     |

**Request Body**:

```json
{
  "name": "string", // Obrigatório
  "email": "string", // Obrigatório - Email válido
  "phone": "string", // Obrigatório - 10-13 dígitos
  "organization_id": "string" // Opcional - UUID
}
```

**Response (200)**:

```json
{
  "success": true,
  "data": { ... }
}
```

---

## 3. Registro

### POST `/sign-up`

Cria nova conta de usuário com organização.

| Campo            | Valor   |
| ---------------- | ------- |
| **Acesso**       | Público |
| **Autenticação** | Não     |

**Request Body**:

```json
{
  "name": "string", // Obrigatório
  "email": "string", // Obrigatório - Email válido
  "phone": "string", // Obrigatório
  "organization": "string", // Obrigatório - Nome da organização
  "password": "string", // Obrigatório - Mínimo 8 caracteres
  "confirmPassword": "string" // Obrigatório
}
```

---

## 4. Usuários

### GET `/user`

Lista todos os usuários.

| Campo            | Valor |
| ---------------- | ----- |
| **Acesso**       | Admin |
| **Autenticação** | Sim   |

**Response (200)**: Array de usuários

---

### GET `/user/:id`

Obtém detalhes de um usuário.

| Campo            | Valor       |
| ---------------- | ----------- |
| **Acesso**       | Admin, User |
| **Autenticação** | Sim         |

**Path Parameters**:

- `id`: UUID do usuário

---

### POST `/user`

Cria novo usuário (admin only).

| Campo            | Valor |
| ---------------- | ----- |
| **Acesso**       | Admin |
| **Autenticação** | Sim   |

**Request Body**:

```json
{
  "name": "string",              // Obrigatório
  "email": "string",             // Obrigatório - Email válido
  "phone": "string",             // Obrigatório
  "password": "string",          // Obrigatório - Mínimo 8 caracteres
  "confirmPassword": "string",   // Obrigatório
  "role": "user" | "admin",      // Opcional - Default: user
  "organization_id": "string"    // Opcional - UUID
}
```

**Response (201)**: Usuário criado

---

### PATCH `/user/:id`

Atualiza usuário.

| Campo            | Valor |
| ---------------- | ----- |
| **Acesso**       | Admin |
| **Autenticação** | Sim   |

**Path Parameters**:

- `id`: UUID do usuário

**Request Body**:

```json
{
  "name": "string",              // Opcional
  "email": "string",             // Opcional
  "phone": "string",             // Opcional
  "role": "user" | "admin",      // Opcional
  "status": "active" | "inactive", // Opcional
  "organization_id": "string"    // Opcional - UUID ou null
}
```

---

## 5. Agentes

### GET `/agent`

Lista todos os agentes (admin).

| Campo            | Valor |
| ---------------- | ----- |
| **Acesso**       | Admin |
| **Autenticação** | Sim   |

**Response (200)**:

```json
{
  "data": [ ... ]
}
```

---

### GET `/agent/list`

Lista agentes do usuário/organização.

| Campo            | Valor       |
| ---------------- | ----------- |
| **Acesso**       | Admin, User |
| **Autenticação** | Sim         |

**Response (200)**: Array de agentes

---

### GET `/agent/:id`

Obtém detalhes de um agente.

| Campo            | Valor |
| ---------------- | ----- |
| **Acesso**       | Admin |
| **Autenticação** | Sim   |

**Path Parameters**:

- `id`: UUID do agente

**Response (200)**:

```json
{
  "data": { ... }
}
```

---

### POST `/agent/create`

Cria novo agente.

| Campo            | Valor |
| ---------------- | ----- |
| **Acesso**       | Admin |
| **Autenticação** | Sim   |

**Request Body**:

```json
{
  "name": "string",              // Obrigatório
  "agentIdentifier": "string",   // Opcional - Identificador único
  "model": "string",             // Opcional - Modelo de IA
  "temperature": 0.4,            // Opcional - 0 a 1
  "withHistory": true,           // Opcional - Histórico de conversas
  "instructions": {              // Obrigatório
    "context": "string",         // Contexto do agente
    "diretrizes": ["string"],    // Opcional - Array de diretrizes
    "objetivo": "string"         // Objetivo do agente
  },
  "parser": {                    // Opcional - Parser JSON estruturado
    "name": "string",
    "description": "string",
    "schema": { ... }
  },
  "sites": ["string"]            // Opcional - URLs para RAG
}
```

**Response (201)**: Agente criado

---

### POST `/agent/create/attendant`

Cria agente atendente.

| Campo            | Valor       |
| ---------------- | ----------- |
| **Acesso**       | Admin, User |
| **Autenticação** | Sim         |

**Request Body**:

```json
{
  "name": "string", // Obrigatório
  "agentIdentifier": "string", // Opcional
  "model": "string", // Opcional
  "temperature": 0.4, // Opcional
  "withHistory": true, // Opcional
  "instructions": {
    // Obrigatório
    "context": "string",
    "diretrizes": ["string"],
    "objetivo": "string"
  },
  "organizationId": "string", // Opcional - UUID
  "databaseTool": false, // Opcional
  "vectorSearchTool": false, // Opcional
  "sites": ["string"] // Opcional
}
```

---

### PATCH `/agent/:id`

Atualiza agente.

| Campo            | Valor |
| ---------------- | ----- |
| **Acesso**       | Admin |
| **Autenticação** | Sim   |

**Path Parameters**:

- `id`: UUID do agente

**Request Body**:

```json
{
  "name": "string",              // Opcional
  "agentIdentifier": "string",   // Opcional
  "model": "string",             // Opcional
  "temperature": 0.4,            // Opcional
  "withHistory": true,           // Opcional
  "instructions": {              // Opcional
    "context": "string",
    "diretrizes": ["string"],
    "objetivo": "string"
  },
  "sites": ["string"],           // Opcional
  "parser": { ... },             // Opcional
  "organizationId": "string",    // Opcional
  "organization_id": "string"    // Opcional (alias)
}
```

**Response (200)**:

```json
{
  "data": { ... }
}
```

---

### POST `/agent/generate-source`

Gera fonte de conhecimento (PDF ou URL).

| Campo            | Valor |
| ---------------- | ----- |
| **Acesso**       | Admin |
| **Autenticação** | Sim   |

**Request Body (JSON)**:

```json
{
  "url": "string", // Opcional - URL(s) separadas por vírgula
  "sourceType": "string", // Opcional - "pdf" ou "site"
  "agentId": "string" // Opcional - UUID do agente
}
```

**Request Body (Multipart)**:

- `file`: Arquivo PDF (Buffer)
- `sourceType`: string
- `agentId`: string
- `url`: string (opcional)

**Response (200)**:

```json
{
  "message": "Fonte de conhecimento processada com sucesso"
}
```

---

### POST `/agent/load-sites`

Carrega sites para RAG do agente.

| Campo            | Valor |
| ---------------- | ----- |
| **Acesso**       | Admin |
| **Autenticação** | Sim   |

**Request Body**:

```json
{
  "sites": "string", // Obrigatório - URLs separadas por vírgula
  "agentId": "string" // Obrigatório - UUID do agente
}
```

---

## 6. Chat AI

### POST `/support/question`

Envia pergunta com resposta em streaming.

| Campo            | Valor       |
| ---------------- | ----------- |
| **Acesso**       | Autenticado |
| **Autenticação** | Sim         |

**Request Body**:

```json
{
  "question": "string", // Obrigatório
  "phone": "string", // Obrigatório
  "name": "string", // Obrigatório
  "agentId": "string" // Obrigatório - UUID do agente
}
```

**Response**: Stream de texto (chunked)

**Headers de Response**:

```
Content-Type: text/plain; charset=utf-8
Transfer-Encoding: chunked
```

---

### POST `/chat/attendant`

Chat com atendente AI (público).

| Campo            | Valor   |
| ---------------- | ------- |
| **Acesso**       | Público |
| **Autenticação** | Não     |

**Request Body**:

```json
{
  "question": "string", // Obrigatório
  "phone": "string", // Obrigatório
  "name": "string", // Obrigatório
  "agentId": "string" // Obrigatório - UUID do agente
}
```

**Response (200)**: Resposta da IA

---

## 7. Sessões

### POST `/session`

Cria sessão se não existir.

| Campo            | Valor       |
| ---------------- | ----------- |
| **Acesso**       | Autenticado |
| **Autenticação** | Sim         |

**Request Body**:

```json
{
  "agent_id": "string", // Obrigatório - UUID do agente
  "user_id": "string", // Opcional - UUID do usuário
  "expires_at": "Date" // Opcional
}
```

**Response (200)**: "Session created successfully"

---

## 8. Organizações

### GET `/organization`

Lista organizações.

| Campo            | Valor |
| ---------------- | ----- |
| **Acesso**       | Admin |
| **Autenticação** | Sim   |

**Query Parameters** (todos opcionais):

- `name`: string
- `acronym`: string
- `email_domain`: string
- `contact_name`: string
- `contact_email`: string
- `status`: string
- `plan`: string
- `activated_at`: string

---

### GET `/organization/:id`

Obtém detalhes de uma organização.

| Campo            | Valor       |
| ---------------- | ----------- |
| **Acesso**       | Admin, User |
| **Autenticação** | Sim         |

**Path Parameters**:

- `id`: UUID da organização

---

### POST `/organization`

Cria nova organização.

| Campo            | Valor |
| ---------------- | ----- |
| **Acesso**       | Admin |
| **Autenticação** | Sim   |

**Request Body**:

```json
{
  "name": "string",          // Obrigatório
  "acronym": "string",       // Obrigatório
  "email_domain": "string",  // Obrigatório
  "contact_name": "string",  // Obrigatório
  "contact_email": "string", // Obrigatório
  "created_by": "string",    // Obrigatório
  "plan": "manual" | "free" | "monthly"  // Opcional
}
```

---

### GET `/organization/:id/embed-settings`

Obtém configurações do chat embed.

| Campo            | Valor |
| ---------------- | ----- |
| **Acesso**       | Admin |
| **Autenticação** | Sim   |

**Path Parameters**:

- `id`: UUID da organização

**Response (200)**:

```json
{
  "chat_embed_enabled": true,
  "chat_embed_token": "string",
  "chat_embed_agent_id": "string",
  "chat_embed_primary_color": "#5A3E95",
  "chat_embed_button_position": "bottom-right",
  "chat_embed_greeting": "string",
  "chat_embed_welcome_enabled": true
}
```

---

### PATCH `/organization/:id/embed-settings`

Atualiza configurações do chat embed.

| Campo            | Valor |
| ---------------- | ----- |
| **Acesso**       | Admin |
| **Autenticação** | Sim   |

**Path Parameters**:

- `id`: UUID da organização

**Request Body**:

```json
{
  "chat_embed_enabled": true,           // Opcional
  "chat_embed_agent_id": "string",      // Opcional - UUID ou null
  "chat_embed_primary_color": "#5A3E95", // Opcional - Hex color
  "chat_embed_button_position": "bottom-right" | "bottom-left" | "top-right" | "top-left",
  "chat_embed_greeting": "string",      // Opcional
  "chat_embed_welcome_enabled": true    // Opcional
}
```

---

### POST `/organization/:id/embed/regenerate-token`

Regenera token do chat embed.

| Campo            | Valor |
| ---------------- | ----- |
| **Acesso**       | Admin |
| **Autenticação** | Sim   |

**Path Parameters**:

- `id`: UUID da organização

**Response (200)**: Novo token gerado

---

### GET `/public/embed/chat.js`

Obtém script do chat embed.

| Campo            | Valor   |
| ---------------- | ------- |
| **Acesso**       | Público |
| **Autenticação** | Não     |

**Response**: JavaScript file

---

### GET `/public/embed/chat`

Obtém página HTML do chat embed.

| Campo            | Valor   |
| ---------------- | ------- |
| **Acesso**       | Público |
| **Autenticação** | Não     |

**Response**: HTML page

---

## 9. Relatórios

### GET `/report`

Lista relatórios.

| Campo            | Valor       |
| ---------------- | ----------- |
| **Acesso**       | Admin, User |
| **Autenticação** | Sim         |

**Query Parameters** (todos opcionais):

- `sentiment`: "positive" | "negative" | "neutral"
- `type`: "appointment" | "order" | "faq"
- `agent_id`: string (UUID)
- `agent_ids`: string | string[] (UUIDs separados por vírgula)
- `created_at`: Date | string

---

### GET `/report/:id`

Obtém detalhes de um relatório.

| Campo            | Valor       |
| ---------------- | ----------- |
| **Acesso**       | Admin, User |
| **Autenticação** | Sim         |

**Path Parameters**:

- `id`: UUID do relatório

---

## 10. Analytics

### GET `/analytics/dashboard-data`

Obtém dados do dashboard.

| Campo            | Valor       |
| ---------------- | ----------- |
| **Acesso**       | Admin, User |
| **Autenticação** | Sim         |

**Query Parameters** (todos opcionais):

- `organization_id`: string (admin only)
- `agent_id`: string
- `agent_ids`: string (UUIDs separados por vírgula)
- `sentiment`: string
- `type`: string
- `created_at`: string (single day)
- `start`: string (date)
- `end`: string (date)

**Response (200)**:

```json
{
  "totalVolume": 100,
  "byType": {
    "appointment": 40,
    "order": 35,
    "faq": 25
  },
  "bySentiment": {
    "positive": 60,
    "negative": 20,
    "neutral": 20
  },
  "appointmentConversion": {
    "totalAppointments": 40,
    "scheduledAppointments": 30,
    "rate": 0.75
  }
}
```

---

## 11. Sources

### GET `/source`

Lista fontes de conhecimento de um agente.

| Campo            | Valor       |
| ---------------- | ----------- |
| **Acesso**       | Admin, User |
| **Autenticação** | Sim         |

**Query Parameters**:

- `agent_id`: string (Obrigatório)

---

### GET `/source/:id`

Obtém detalhes de uma fonte.

| Campo            | Valor       |
| ---------------- | ----------- |
| **Acesso**       | Admin, User |
| **Autenticação** | Sim         |

**Path Parameters**:

- `id`: UUID da fonte

---

### DELETE `/source/:id`

Remove uma fonte de conhecimento.

| Campo            | Valor       |
| ---------------- | ----------- |
| **Acesso**       | Admin, User |
| **Autenticação** | Sim         |

**Path Parameters**:

- `id`: UUID da fonte

**Response (204)**: No content

---

## 12. Token Usage

### GET `/token-usage`

Obtém uso de tokens.

| Campo            | Valor       |
| ---------------- | ----------- |
| **Acesso**       | Autenticado |
| **Autenticação** | Sim         |

**Query Parameters** (todos opcionais):

- `start_date`: string (ISO date)
- `end_date`: string (ISO date)
- `organization_id`: string (UUID - admin only)

---

## 13. WhatsApp

### POST `/whatsapp/webhook`

Webhook para receber mensagens do WhatsApp (Twilio).

| Campo            | Valor   |
| ---------------- | ------- |
| **Acesso**       | Público |
| **Autenticação** | Não     |

**Request Body** (Twilio format):

```json
{
  "SmsMessageSid": "string",
  "NumMedia": "string",
  "ProfileName": "string",
  "MessageType": "string",
  "SmsSid": "string",
  "WaId": "string",
  "SmsStatus": "string",
  "Body": "string",
  "To": "string",
  "NumSegments": "string",
  "ReferralNumMedia": "string",
  "MessageSid": "string",
  "AccountSid": "string",
  "ChannelMetadata": "string",
  "From": "string",
  "ApiVersion": "string"
}
```

**Response (200)**: `<Response/>`

---

## 14. Inteligência Artificial

### POST `/artificial-intelligence/convert-text-to-speech`

Converte texto em áudio.

| Campo            | Valor   |
| ---------------- | ------- |
| **Acesso**       | Público |
| **Autenticação** | Não     |

**Request Body**:

```json
{
  "text": "string" // Obrigatório
}
```

---

## Tipos Comuns

### AIInstructions

```typescript
{
  context: string;       // Contexto do agente
  diretrizes?: string[]; // Diretrizes opcionais
  objetivo: string;      // Objetivo do agente
}
```

### OrganizationPlan

```typescript
'manual' | 'free' | 'monthly';
```

### UserRole

```typescript
'user' | 'admin';
```

### UserStatus

```typescript
'active' | 'inactive';
```

### ReportSentiment

```typescript
'positive' | 'negative' | 'neutral';
```

### ReportType

```typescript
'appointment' | 'order' | 'faq';
```

### ButtonPosition

```typescript
'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
```

---

## Códigos de Erro

| Código | Descrição                |
| ------ | ------------------------ |
| 200    | Sucesso                  |
| 201    | Criado com sucesso       |
| 204    | Sem conteúdo (sucesso)   |
| 400    | Requisição inválida      |
| 401    | Não autorizado           |
| 403    | Acesso negado            |
| 404    | Não encontrado           |
| 500    | Erro interno do servidor |

---

## Autenticação

### Headers

```
Authorization: Bearer <jwt_token>
```

### Roles

- **admin**: Acesso total
- **user**: Acesso limitado à própria organização

### Decorators

- `@Public()`: Rota pública, sem autenticação
- `@Roles('admin')`: Apenas admin
- `@Roles('admin', 'user')`: Admin ou user autenticado

---

## Notas de Integração

1. **Streaming**: O endpoint `/support/question` retorna resposta em streaming. Use `fetch` com `reader.read()` para processar chunks.

2. **Multipart**: O endpoint `/agent/generate-source` aceita tanto JSON quanto multipart para upload de PDFs.

3. **Filtros de Data**: Use formato ISO 8601 para datas (ex: `2024-01-15`).

4. **UUIDs**: Todos os IDs são UUIDs v4.

5. **Validação**: Todos os campos são validados via `class-validator`. Erros de validação retornam status 400.
