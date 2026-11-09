import type { IEmbeddingsService } from 'src/infrastructure/providers/voyage.provider';
import { RecordChatMessageService } from 'src/modules/chat/record-chat-message/record-chat-message.service';
import type { MessageRepository } from 'src/modules/sessions/repositories/message.repository';

describe('RecordChatMessageService', () => {
  it('grava mensagem mesmo se a geração de embedding falhar por tamanho ou indisponibilidade', async () => {
    const messageRepository = {
      create: jest.fn().mockResolvedValue({ id: 'msg-1' }),
    } as unknown as MessageRepository;

    const embeddings = {
      embedQuery: jest
        .fn()
        .mockRejectedValue(new Error('Input text exceeds context window')),
    } as unknown as IEmbeddingsService;

    const service = new RecordChatMessageService(messageRepository, embeddings);

    await service.execute(
      'session-1',
      'user-1',
      'agent-1',
      'X'.repeat(50000),
      'agent',
    );

    expect(embeddings.embedQuery).toHaveBeenCalledWith('X'.repeat(32000));
    expect(messageRepository.create).toHaveBeenCalledWith({
      session_id: 'session-1',
      user_id: 'user-1',
      agent_id: 'agent-1',
      from: 'agent',
      message: 'X'.repeat(50000),
      embedding: null,
    });
  });

  it('grava mensagem com embedding quando embedQuery responde com sucesso', async () => {
    const mockEmbedding = [0.1, 0.2, 0.3];
    const messageRepository = {
      create: jest.fn().mockResolvedValue({ id: 'msg-2' }),
    } as unknown as MessageRepository;

    const embeddings = {
      embedQuery: jest.fn().mockResolvedValue(mockEmbedding),
    } as unknown as IEmbeddingsService;

    const service = new RecordChatMessageService(messageRepository, embeddings);

    await service.execute(
      'session-1',
      'user-1',
      'agent-1',
      'Mensagem normal',
      'user',
    );

    expect(embeddings.embedQuery).toHaveBeenCalledWith('Mensagem normal');
    expect(messageRepository.create).toHaveBeenCalledWith({
      session_id: 'session-1',
      user_id: 'user-1',
      agent_id: 'agent-1',
      from: 'user',
      message: 'Mensagem normal',
      embedding: mockEmbedding,
    });
  });
});
