---
description: Vendored LangChain JS reference for ChatAnthropic — instantiation, prompt caching, citations, context management. Use when configuring or changing the ChatAnthropic model.
---

## Custom headers

You can pass custom headers in your requests like this:

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatAnthropic } from '@langchain/anthropic';

const llmWithCustomHeaders = new ChatAnthropic({
  model: 'claude-sonnet-4-6',
  maxTokens: 1024,
  clientOptions: {
    defaultHeaders: {
      'X-Api-Key': process.env.ANTHROPIC_API_KEY,
    },
  },
});

await llmWithCustomHeaders.invoke('Why is the sky blue?');
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
AIMessage {
  "id": "msg_019z4nWpShzsrbSHTWXWQh6z",
  "content": "The sky appears blue due to a phenomenon called Rayleigh scattering. Here's a brief explanation:\n\n1) Sunlight is made up of different wavelengths of visible light, including all the colors of the rainbow.\n\n2) As sunlight passes through the atmosphere, the gases (mostly nitrogen and oxygen) cause the shorter wavelengths of light, such as violet and blue, to be scattered more easily than the longer wavelengths like red and orange.\n\n3) This scattering of the shorter blue wavelengths occurs in all directions by the gas molecules in the atmosphere.\n\n4) Our eyes are more sensitive to the scattered blue light than the scattered violet light, so we perceive the sky as having a blue color.\n\n5) The scattering is more pronounced for light traveling over longer distances through the atmosphere. This is why the sky appears even darker blue when looking towards the horizon.\n\nSo in essence, the selective scattering of the shorter blue wavelengths of sunlight by the gases in the atmosphere is what causes the sky to appear blue to our eyes during the daytime.",
  "additional_kwargs": {
    "id": "msg_019z4nWpShzsrbSHTWXWQh6z",
    "type": "message",
    "role": "assistant",
    "model": "claude-3-sonnet-20240229",
    "stop_reason": "end_turn",
    "stop_sequence": null,
    "usage": {
      "input_tokens": 13,
      "output_tokens": 236
    }
  },
  "response_metadata": {
    "id": "msg_019z4nWpShzsrbSHTWXWQh6z",
    "model": "claude-3-sonnet-20240229",
    "stop_reason": "end_turn",
    "stop_sequence": null,
    "usage": {
      "input_tokens": 13,
      "output_tokens": 236
    },
    "type": "message",
    "role": "assistant"
  },
  "tool_calls": [],
  "invalid_tool_calls": [],
  "usage_metadata": {
    "input_tokens": 13,
    "output_tokens": 236,
    "total_tokens": 249
  }
}
```

## Prompt caching

Anthropic supports [caching parts of your prompt](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) in order to reduce costs for use-cases that require long context. You can cache tools and both entire messages and individual blocks.

The initial request containing one or more blocks or tool definitions with a `"cache_control": { "type": "ephemeral" }` field will automatically cache that part of the prompt. This initial caching step will cost extra, but subsequent requests will be billed at a reduced rate. The cache has a lifetime of 5 minutes, but this is refreshed each time the cache is hit. For longer caching, specify `"ttl": "1h"` in the `cache_control` field.

There is a minimum cacheable prompt length, which varies according to model. For more information, see [prompt caching details](https://platform.claude.com/docs/en/build-with-claude/prompt-caching#cache-limitations).

Here's an example of caching part of a system message that contains the LangChain [conceptual docs](/oss/javascript/concepts/):

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
let CACHED_TEXT = '...';
```

```typescript expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// @lc-docs-hide-cell

CACHED_TEXT = `## Components

LangChain provides standard, extendable interfaces and external integrations for various components useful for building with LLMs.
Some components LangChain implements, some components we rely on third-party integrations for, and others are a mix.

### Chat models

<span data-heading-keywords="chat model,chat models"></span>

Language models that use a sequence of messages as inputs and return chat messages as outputs (as opposed to using plain text).
These are generally newer models (older models are generally \`LLMs\`, see below).
Chat models support the assignment of distinct roles to conversation messages, helping to distinguish messages from the AI, users, and instructions such as system messages.

Although the underlying models are messages in, message out, the LangChain wrappers also allow these models to take a string as input.
This gives them the same interface as LLMs (and simpler to use).
When a string is passed in as input, it will be converted to a \`HumanMessage\` under the hood before being passed to the underlying model.

LangChain does not host any Chat Models, rather we rely on third party integrations.

We have some standardized parameters when constructing ChatModels:

- \`model\`: the name of the model

Chat Models also accept other parameters that are specific to that integration.

<Warning>
**Some chat models have been fine-tuned for **tool calling** and provide a dedicated API for it.**

Generally, such models are better at tool calling than non-fine-tuned models, and are recommended for use cases that require tool calling.
Please see the [tool calling section](/oss/javascript/langchain/tools) for more information.
</Warning>

For specifics on how to use chat models, see the [relevant how-to guides here](/oss/javascript/langchain/models).

#### Multimodality

Some chat models are multimodal, accepting images, audio and even video as inputs.
These are still less common, meaning model providers haven't standardized on the "best" way to define the API.
Multimodal outputs are even less common. As such, we've kept our multimodal abstractions fairly light weight
and plan to further solidify the multimodal APIs and interaction patterns as the field matures.

In LangChain, most chat models that support multimodal inputs also accept those values in OpenAI's content blocks format.
So far this is restricted to image inputs. For models like Gemini which support video and other bytes input, the APIs also support the native, model-specific representations.

For specifics on how to use multimodal models, see the [relevant how-to guides here](/oss/javascript/how-to/#multimodal).

### LLMs

<span data-heading-keywords="llm,llms"></span>

<Warning>
**Pure text-in/text-out LLMs tend to be older or lower-level. Many popular models are best used as [chat completion models](/oss/javascript/langchain/models),**

even for non-chat use cases.

You are probably looking for [the section above instead](/oss/javascript/langchain/models).
</Warning>

Language models that takes a string as input and returns a string.
These are traditionally older models (newer models generally are [Chat Models](/oss/javascript/langchain/models), see above).

Although the underlying models are string in, string out, the LangChain wrappers also allow these models to take messages as input.
This gives them the same interface as [Chat Models](/oss/javascript/langchain/models).
When messages are passed in as input, they will be formatted into a string under the hood before being passed to the underlying model.

LangChain does not host any LLMs, rather we rely on third party integrations.

For specifics on how to use LLMs, see the [relevant how-to guides here](/oss/javascript/langchain/models).

### Message types

Some language models take an array of messages as input and return a message.
There are a few different types of messages.
All messages have a \`role\`, \`content\`, and \`response_metadata\` property.

The \`role\` describes WHO is saying the message.
LangChain has different message classes for different roles.

The \`content\` property describes the content of the message.
This can be a few different things:

- A string (most models deal this type of content)
- A List of objects (this is used for multi-modal input, where the object contains information about that input type and that input location)

#### HumanMessage

This represents a message from the user.

#### AIMessage

This represents a message from the model. In addition to the \`content\` property, these messages also have:

**\`response_metadata\`**

The \`response_metadata\` property contains additional metadata about the response. The data here is often specific to each model provider.
This is where information like log-probs and token usage may be stored.

**\`tool_calls\`**

These represent a decision from an language model to call a tool. They are included as part of an \`AIMessage\` output.
They can be accessed from there with the \`.tool_calls\` property.

This property returns a list of \`ToolCall\`s. A \`ToolCall\` is an object with the following arguments:

- \`name\`: The name of the tool that should be called.
- \`args\`: The arguments to that tool.
- \`id\`: The id of that tool call.

#### SystemMessage

This represents a system message, which tells the model how to behave. Not every model provider supports this.

#### ToolMessage

This represents the result of a tool call. In addition to \`role\` and \`content\`, this message has:

- a \`tool_call_id\` field which conveys the id of the call to the tool that was called to produce this result.
- an \`artifact\` field which can be used to pass along arbitrary artifacts of the tool execution which are useful to track but which should not be sent to the model.

#### (Legacy) FunctionMessage

This is a legacy message type, corresponding to OpenAI's legacy function-calling API. \`ToolMessage\` should be used instead to correspond to the updated tool-calling API.

This represents the result of a function call. In addition to \`role\` and \`content\`, this message has a \`name\` parameter which conveys the name of the function that was called to produce this result.

### Prompt templates

<span data-heading-keywords="prompt,prompttemplate,chatprompttemplate"></span>

Prompt templates help to translate user input and parameters into instructions for a language model.
This can be used to guide a model's response, helping it understand the context and generate relevant and coherent language-based output.

Prompt Templates take as input an object, where each key represents a variable in the prompt template to fill in.

Prompt Templates output a PromptValue. This PromptValue can be passed to an LLM or a ChatModel, and can also be cast to a string or an array of messages.
The reason this PromptValue exists is to make it easy to switch between strings and messages.

There are a few different types of prompt templates:

#### String PromptTemplates

These prompt templates are used to format a single string, and generally are used for simpler inputs.
For example, a common way to construct and use a PromptTemplate is as follows:

\`\`\`typescript
import { PromptTemplate } from "@langchain/core/prompts";

const promptTemplate = PromptTemplate.fromTemplate(
  "Tell me a joke about {topic}"
);

await promptTemplate.invoke({ topic: "cats" });
\`\`\`

#### ChatPromptTemplates

These prompt templates are used to format an array of messages. These "templates" consist of an array of templates themselves.
For example, a common way to construct and use a ChatPromptTemplate is as follows:

\`\`\`typescript
import { ChatPromptTemplate } from "@langchain/core/prompts";

const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant"],
  ["user", "Tell me a joke about {topic}"],
]);

await promptTemplate.invoke({ topic: "cats" });
\`\`\`

In the above example, this ChatPromptTemplate will construct two messages when called.
The first is a system message, that has no variables to format.
The second is a HumanMessage, and will be formatted by the \`topic\` variable the user passes in.
```
