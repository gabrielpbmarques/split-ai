import { StreamChunk, StreamEvent } from 'src/types';

import { isStructuredOutputTool } from './isStructuredOutputTool';
import { textOf } from './textOf';

export async function* handleStreamResponse(
  stream: AsyncGenerator<any>,
): AsyncGenerator<StreamEvent> {
  let finalEmitted = false;
  let errorEmitted = false;
  let pendingFinal: string | undefined;
  let lastText: string | undefined;

  try {
    for await (const raw of stream as AsyncIterable<StreamChunk>) {
      const modelRequest = raw?.model_request;
      const toolMessages = raw?.tools?.messages;

      if (modelRequest) {
        for (const message of modelRequest.messages ?? []) {
          const text = textOf(message.content);
          if (text) lastText = text;

          for (const call of message.tool_calls ?? []) {
            if (isStructuredOutputTool(call?.name)) {
              const raw = call?.args?.finalAnswer;
              if (typeof raw === 'string' && raw.trim()) pendingFinal = raw;
              continue;
            }
            if (call?.name) {
              yield { type: 'status', phase: 'tool_call', tool: call.name };
            }
          }
        }

        const finalAnswer = modelRequest.structuredResponse?.finalAnswer;

        if (finalAnswer && !finalEmitted) {
          finalEmitted = true;
          yield { type: 'final', text: finalAnswer };
        }
      } else if (toolMessages?.length) {
        for (const toolMsg of toolMessages) {
          if (toolMsg?.name && !isStructuredOutputTool(toolMsg.name)) {
            yield {
              type: 'status',
              phase: 'tool_result',
              tool: toolMsg.name,
            };
          }
        }
      }
    }
  } catch (err) {
    const raw = err instanceof Error ? err.message : 'Erro inesperado';
    const message = /recursion limit/i.test(raw)
      ? 'O agente explorou bastante mas não conseguiu consolidar uma resposta. Tente reformular com escopo mais específico.'
      : raw;
    errorEmitted = true;
    yield { type: 'error', message };
  } finally {
    if (!finalEmitted && pendingFinal) {
      finalEmitted = true;
      yield { type: 'final', text: pendingFinal };
    }

    if (!finalEmitted && lastText) {
      finalEmitted = true;
      yield { type: 'final', text: lastText };
    }

    if (!finalEmitted && !errorEmitted) {
      yield {
        type: 'error',
        message:
          'O agente terminou sem produzir uma resposta estruturada. Verifique o modelo/provedor configurado e tente novamente.',
      };
    }
    yield { type: 'done' };
  }
}
