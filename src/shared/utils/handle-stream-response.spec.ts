import { handleStreamResponse } from 'src/shared/utils/handle-stream-response';

describe('handleStreamResponse', () => {
  it('emite finalAnswer e done com sucesso a partir de resposta estruturada', async () => {
    async function* stream() {
      yield {
        model_request: {
          structuredResponse: { finalAnswer: 'Resposta completa' },
        },
      };
    }

    const events = [];
    for await (const event of handleStreamResponse(stream())) {
      events.push(event);
    }

    expect(events).toEqual([
      { type: 'final', text: 'Resposta completa' },
      { type: 'done' },
    ]);
  });

  it('recupera resposta de grande porte truncada em invalid_tool_calls', async () => {
    const largeAnswer = 'Parte inicial muito longa de resposta...'.repeat(100);

    async function* stream() {
      yield {
        model_request: {
          messages: [
            {
              invalid_tool_calls: [
                {
                  name: 'extract',
                  args: `{"finalAnswer":"${largeAnswer}`,
                },
              ],
            },
          ],
        },
      };
    }

    const events = [];
    for await (const event of handleStreamResponse(stream())) {
      events.push(event);
    }

    expect(events).toEqual([
      { type: 'final', text: largeAnswer },
      { type: 'done' },
    ]);
  });

  it('utiliza lastText quando não houver tool_calls nem structuredResponse', async () => {
    async function* stream() {
      yield {
        model_request: {
          messages: [
            {
              content: 'Texto gerado diretamente sem ferramentas',
            },
          ],
        },
      };
    }

    const events = [];
    for await (const event of handleStreamResponse(stream())) {
      events.push(event);
    }

    expect(events).toEqual([
      { type: 'final', text: 'Texto gerado diretamente sem ferramentas' },
      { type: 'done' },
    ]);
  });
});
