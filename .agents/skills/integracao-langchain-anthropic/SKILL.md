---
name: integracao-langchain-anthropic
description: 'Referência de uso e configuração do ChatAnthropic (@langchain/anthropic) no split-ai: CHAT_MODEL_SERVICE, endpoint compatível com Anthropic/DeepSeek (ANTHROPIC_BASE_URL), blocos de conteúdo, tool calling, prompt caching e citações.'
---

# Integração `ChatAnthropic` (`@langchain/anthropic`) no `split-ai`

Referência para configurar, manter ou evoluir o provedor `CHAT_MODEL_SERVICE` (`src/infrastructure/providers/anthropic.provider.ts`) e sua interação com o runtime de agentes (`ResolveAgentService` e `GenerateAiResponseService`).

## Como o `split-ai` instancia o `ChatAnthropic`

Toda instanciação de modelo de chat passa exclusivamente pelo provedor `CHAT_MODEL_SERVICE` (`IChatModelService` em `src/infrastructure/providers/anthropic.provider.ts`):

```typescript
export const CHAT_MODEL_SERVICE = 'CHAT_MODEL_SERVICE';

export interface ChatModelOptions {
  readonly model?: string | null;
  readonly temperature?: number | null;
}

export interface IChatModelService {
  create(options?: ChatModelOptions): BaseChatModel;
  createModel(options?: ChatModelOptions): BaseChatModel;
}
```

- **Compatibilidade Anthropic e DeepSeek (`ANTHROPIC_BASE_URL`):** por padrão, `env.ANTHROPIC_BASE_URL` aponta para `https://api.deepseek.com/anthropic`, permitindo usar modelos como `deepseek-chat-v3.2` ou `deepseek-flash` com a mesma SDK `@langchain/anthropic`. Para apontar para a API oficial da Anthropic (modelos Claude), basta configurar `ANTHROPIC_BASE_URL=https://api.anthropic.com` e a respectiva `ANTHROPIC_API_KEY`.
- **Modo Mock (`env.INTEGRATION_MODE === 'mock'`):** retorna um `FakeListChatModel` determinístico sem realizar chamadas de rede.
- **Falha sob demanda:** se `ANTHROPIC_API_KEY` não estiver definida no modo `live`, `create()` lança `ServiceUnavailableException('Anthropic não configurado')` (`503`) apenas no momento da chamada, nunca quebrando o boot.

## Peculiaridades importantes do `ChatAnthropic`

### 1. Blocos de conteúdo (`content` como string ou array de blocos)

Ao contrário de outros provedores, `AIMessage.content` no `ChatAnthropic` pode ser tanto uma `string` simples quanto um **array de blocos de conteúdo** (`[{ type: 'text', text: '...' }, { type: 'tool_use', id: '...', name: '...', input: {...} }]`).

- Ao extrair texto de uma `AIMessage`, nunca assuma que `message.content` é sempre `string`: trate arrays de blocos concatenando os blocos `{ type: 'text' }`.
- Quando um passo de `tool_use` é interrompido antes de gerar o `ToolMessage` correspondente (`tool_result`), a API rejeita a próxima mensagem na thread com erro `400`. Por isso o runtime aplica `sanitizeToolCallMessages` antes de invocar o modelo (`08-agentes-de-ia.md`).

### 2. Prompt Caching (`cache_control`)

A API suporta cache de partes longas do prompt (mensagens de sistema, documentos extensos ou definições de ferramentas) adicionando `cache_control: { type: 'ephemeral' }` ao bloco:

```typescript
const messages = [
  {
    role: 'system',
    content: [
      {
        type: 'text',
        text: longSystemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
  },
  {
    role: 'user',
    content: userQuestion,
  },
];
```

Os contadores de uso aparecem em `response.response_metadata.usage` (`cache_creation_input_tokens` e `cache_read_input_tokens`).

### 3. Citações nativas (`citations`)

Ao enviar blocos do tipo `document` com `citations: { enabled: true }`, o modelo pode anexar referências exatas de trecho (`char_location`) nos blocos de texto retornados:

```typescript
{
  type: 'document',
  source: {
    type: 'text',
    media_type: 'text/plain',
    data: documentText,
  },
  title: documentTitle,
  citations: { enabled: true },
}
```

### 4. Saída estruturada (`responseFormat`)

No `split-ai`, a saída estruturada do agente não é feita com parsers manuais de texto, mas passando o schema Zod (`AgentFinalResponseSchema` mesclado a `agent.response_format`) para `createDeepAgent` / `GenerateAiResponseService`.
