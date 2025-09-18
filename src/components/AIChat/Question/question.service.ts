import { Injectable } from '@nestjs/common';
import { QuestionDto } from './question.dto';
import { User } from 'src/models/User.model';
import { GenerateAiResponseService } from 'src/components/ArtificialIntelligence/GenerateAIResponse/generate-ai-response.service';
import { CreateSessionIfNotExistsService } from 'src/components/Session/CreateSessionIfNotExists/create-session-if-not-exists.service';
import { AIMessageChunk } from '@langchain/core/messages';
import { MessageRepository } from 'src/supabase-repositories/message.repository';
import { ResolveAgentService } from 'src/components/ArtificialIntelligence/ResolveAgent/resolve-agent.service';
import { IterableReadableStream } from '@langchain/core/dist/utils/stream';

const STREAM = true;

@Injectable()
export class QuestionService {
  constructor(
    private readonly generateAiResponseService: GenerateAiResponseService,
    private readonly createSessionIfNotExistsService: CreateSessionIfNotExistsService,
    private readonly messageRepository: MessageRepository,
    private readonly resolveAgentService: ResolveAgentService,
  ) {}

  async execute(
    dto: QuestionDto,
    user: User,
    onMessage: (chunk: AIMessageChunk) => void,
  ): Promise<void> {
    const { question, agentId } = dto;

    const agent = await this.resolveAgentService.resolve(agentId);

    const session = await this.createSessionIfNotExistsService.execute({
      agent_id: agent.id,
      user_id: user._id,
    });

    const aiResponse = await this.generateAiResponseService.execute(
      question,
      {
        session_id: session.id,
      },
      agent,
      STREAM,
    );

    let full = '';
    for await (const chunk of aiResponse as IterableReadableStream<AIMessageChunk>) {
      if (chunk?.content) {
        const text = chunk.content.toString();
        full += text;
        onMessage(chunk);
      }
    }

    await this.messageRepository.create({
      session_id: session.id,
      message: full,
      from: 'agent',
    });
  }
}
