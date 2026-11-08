import type { AuthenticatedUser } from 'src/auth/authenticated-user';
import type { GenerateAiResponseService } from 'src/modules/agent-runtime/generate-ai-response/generate-ai-response.service';
import type { ResolveAgentService } from 'src/modules/agent-runtime/resolve-agent/resolve-agent.service';
import { QuestionService } from 'src/modules/chat/question/question.service';
import type { RecordChatMessageService } from 'src/modules/chat/record-chat-message/record-chat-message.service';
import type { CreateSessionIfNotExistsService } from 'src/modules/sessions/create-session-if-not-exists/create-session-if-not-exists.service';
import type { StreamEvent } from 'src/shared/contracts';

jest.mock('@langchain/quickjs', () => ({
  createCodeInterpreterMiddleware: jest.fn(),
}));

async function* mockStream(events: StreamEvent[]): AsyncGenerator<StreamEvent> {
  for (const event of events) {
    yield event;
  }
}

describe('QuestionService', () => {
  it('repassa o header Authorization para o ResolveAgentService via promptVariables sem verificar o JWT diretamente', async () => {
    const createSessionIfNotExistsService = {
      execute: jest.fn().mockResolvedValue({ id: 'session-1' }),
    } as unknown as CreateSessionIfNotExistsService;

    const resolveAgentService = {
      execute: jest.fn().mockResolvedValue({ id: 'agent-1' }),
    } as unknown as ResolveAgentService;

    const recordChatMessageService = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as unknown as RecordChatMessageService;

    const generateAiResponseService = {
      execute: jest
        .fn()
        .mockResolvedValue(
          mockStream([
            { type: 'final', text: 'Olá, Senhor Gabriel.' },
            { type: 'done' },
          ]),
        ),
    } as unknown as GenerateAiResponseService;

    const service = new QuestionService(
      generateAiResponseService,
      createSessionIfNotExistsService,
      resolveAgentService,
      recordChatMessageService,
    );

    const user: AuthenticatedUser = {
      id: 'user-123',
      name: 'Gabriel',
      email: 'gabriel@example.com',
      phone: '+5511999999999',
      role: 'admin',
      permissions: ['chat.ask'],
    };

    const events: StreamEvent[] = [];

    await service.execute(
      {
        question: 'Sou eu mesmo?',
        threadId: 'thread-abc',
        variables: { customKey: 'customVal', authorization: 'spoofed' },
      },
      { agentId: 'sherlock' },
      user,
      'Bearer valid-jwt-token',
      (event) => events.push(event),
    );

    expect(resolveAgentService.execute).toHaveBeenCalledWith('sherlock', {
      customKey: 'customVal',
      sessionId: 'session-1',
      threadId: 'thread-abc',
      authorization: 'Bearer valid-jwt-token',
    });
    expect(recordChatMessageService.execute).toHaveBeenCalledTimes(2);
    expect(events).toEqual([
      { type: 'final', text: 'Olá, Senhor Gabriel.' },
      { type: 'done' },
    ]);
  });
});
