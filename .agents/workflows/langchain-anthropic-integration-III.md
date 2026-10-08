---
description: Vendored LangChain JS reference for ChatAnthropic — instantiation, prompt caching, citations, context management. Use when configuring or changing the ChatAnthropic model.
---

#### MessagesPlaceholder

<span data-heading-keywords="messagesplaceholder"></span>

This prompt template is responsible for adding an array of messages in a particular place.
In the above ChatPromptTemplate, we saw how we could format two messages, each one a string.
But what if we wanted the user to pass in an array of messages that we would slot into a particular spot?
This is how you use MessagesPlaceholder.

\`\`\`typescript
import {
ChatPromptTemplate,
MessagesPlaceholder,
} from "@langchain/core/prompts";
import { HumanMessage } from "@langchain/core/messages";

const promptTemplate = ChatPromptTemplate.fromMessages([
["system", "You are a helpful assistant"],
new MessagesPlaceholder("msgs"),
]);

promptTemplate.invoke({ msgs: [new HumanMessage({ content: "hi!" })] });
\`\`\`

This will produce an array of two messages, the first one being a system message, and the second one being the HumanMessage we passed in.
If we had passed in 5 messages, then it would have produced 6 messages in total (the system message plus the 5 passed in).
This is useful for letting an array of messages be slotted into a particular spot.

An alternative way to accomplish the same thing without using the \`MessagesPlaceholder\` class explicitly is:

\`\`\`typescript
const promptTemplate = ChatPromptTemplate.fromMessages([
["system", "You are a helpful assistant"],
["placeholder", "{msgs}"], // <-- This is the changed part
]);
\`\`\`

For specifics on how to use prompt templates, see the [relevant how-to guides here](/oss/javascript/how-to/#prompt-templates).

### Example Selectors

One common prompting technique for achieving better performance is to include examples as part of the prompt.
This gives the language model concrete examples of how it should behave.
Sometimes these examples are hardcoded into the prompt, but for more advanced situations it may be nice to dynamically select them.
Example Selectors are classes responsible for selecting and then formatting examples into prompts.

For specifics on how to use example selectors, see the [relevant how-to guides here](/oss/javascript/how-to/#example-selectors).

### Output parsers

<span data-heading-keywords="output parser"></span>

<Note>
**The information here refers to parsers that take a text output from a model try to parse it into a more structured representation.**

More and more models are supporting function (or tool) calling, which handles this automatically.
It is recommended to use function/tool calling rather than output parsing.
See the [LangChain tools documentation](/oss/javascript/langchain/tools).

</Note>

Responsible for taking the output of a model and transforming it to a more suitable format for downstream tasks.
Useful when you are using LLMs to generate structured data, or to normalize output from chat models and LLMs.

There are two main methods an output parser must implement:

- "Get format instructions": A method which returns a string containing instructions for how the output of a language model should be formatted.
- "Parse": A method which takes in a string (assumed to be the response from a language model) and parses it into some structure.

And then one optional one:

- "Parse with prompt": A method which takes in a string (assumed to be the response from a language model) and a prompt (assumed to be the prompt that generated such a response) and parses it into some structure. The prompt is largely provided in the event the OutputParser wants to retry or fix the output in some way, and needs information from the prompt to do so.

Output parsers accept a string or \`BaseMessage\` as input and can return an arbitrary type.

LangChain has many different types of output parsers. This is a list of output parsers LangChain supports. The table below has various pieces of information:

**Name**: The name of the output parser

**Supports Streaming**: Whether the output parser supports streaming.

**Input Type**: Expected input type. Most output parsers work on both strings and messages, but some (like OpenAI Functions) need a message with specific arguments.

**Output Type**: The output type of the object returned by the parser.

**Description**: Our commentary on this output parser and when to use it.

The current date is ${new Date().toISOString()}`;

// Noop statement to hide output
void 0;

````

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatAnthropic } from '@langchain/anthropic';

const modelWithCaching = new ChatAnthropic({
  model: 'claude-sonnet-4-6',
});

const LONG_TEXT = `You are a pirate. Always respond in pirate dialect.

Use the following as context when answering questions:

${CACHED_TEXT}`;

const messages = [
  {
    role: 'system',
    content: [
      {
        type: 'text',
        text: LONG_TEXT,
        // Tell Anthropic to cache this block
        cache_control: { type: 'ephemeral' },
      },
    ],
  },
  {
    role: 'user',
    content: 'What types of messages are supported in LangChain?',
  },
];

const res = await modelWithCaching.invoke(messages);

console.log('USAGE:', res.response_metadata.usage);
````

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
USAGE: {
  input_tokens: 18,
  cache_creation_input_tokens: 2960,
  cache_read_input_tokens: 0,
  cache_creation: { ephemeral_5m_input_tokens: 2960, ephemeral_1h_input_tokens: 0 },
  output_tokens: 433,
  service_tier: 'standard',
  inference_geo: 'global'
}
```

We can see that there's a new field called `cache_creation_input_tokens` in the raw usage field returned from Anthropic.

If we use the same messages again, we can see that the long text's input tokens are read from the cache:

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const res2 = await modelWithCaching.invoke(messages);

console.log('USAGE:', res2.response_metadata.usage);
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
USAGE: {
  input_tokens: 18,
  cache_creation_input_tokens: 0,
  cache_read_input_tokens: 2960,
  cache_creation: { ephemeral_5m_input_tokens: 0, ephemeral_1h_input_tokens: 0 },
  output_tokens: 393,
  service_tier: 'standard',
  inference_geo: 'global'
}
```

### Tool caching

You can also cache tools by setting the same `"cache_control": { "type": "ephemeral" }` within a tool definition. This currently requires you to bind a tool in [Anthropic's raw tool format](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) Here's an example:

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const SOME_LONG_DESCRIPTION = '...';

// Tool in Anthropic format
const anthropicTools = [
  {
    name: 'get_weather',
    description: SOME_LONG_DESCRIPTION,
    input_schema: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'Location to get the weather for',
        },
        unit: {
          type: 'string',
          description: 'Temperature unit to return',
        },
      },
      required: ['location'],
    },
    // Tell Anthropic to cache this tool
    cache_control: { type: 'ephemeral' },
  },
];

const modelWithCachedTools = modelWithCaching.bindTools(anthropicTools);

await modelWithCachedTools.invoke('what is the weather in SF?');
```

For more on how prompt caching works, see [Anthropic's docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching#how-prompt-caching-works).

## Custom clients

Anthropic models [may be hosted on cloud services such as Google Vertex](https://platform.claude.com/docs/en/build-with-claude/claude-on-vertex-ai) that rely on a different underlying client with the same interface as the primary Anthropic client. You can access these services by providing a `createClient` method that returns an initialized instance of an Anthropic client. Here's an example:

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AnthropicVertex } from '@anthropic-ai/vertex-sdk';

const customClient = new AnthropicVertex();

const modelWithCustomClient = new ChatAnthropic({
  modelName: 'claude-sonnet-4-6',
  maxRetries: 0,
  createClient: () => customClient,
});

await modelWithCustomClient.invoke([{ role: 'user', content: 'Hello!' }]);
```

## Citations

Anthropic supports a [citations](https://platform.claude.com/docs/en/build-with-claude/citations) feature that lets Claude attach context to its answers based on source material supplied by the user. This source material can be provided either as [document content blocks](https://platform.claude.com/docs/en/build-with-claude/citations#document-types), which describe full documents, or as [search results](https://platform.claude.com/docs/en/build-with-claude/search-results), which describe relevant passages or snippets returned from a retrieval system. When `"citations": { "enabled": true }` is included in a query, Claude may generate direct citations to the provided material in its response.
