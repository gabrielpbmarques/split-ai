import { Injectable } from '@nestjs/common';
import { AIMessageChunk } from 'langchain';
import { RecordChatMessageService } from 'src/components/AIChat/RecordChatMessage/record-chat-message.service';
import { GenerateAiResponseService } from 'src/components/ArtificialIntelligence/GenerateAIResponse/generate-ai-response.service';
import { ResolveAgentService } from 'src/components/ArtificialIntelligence/ResolveAgent/resolve-agent.service';
import { CreateSessionIfNotExistsService } from 'src/components/Session/CreateSessionIfNotExists/create-session-if-not-exists.service';
import { UserEntity } from 'src/entities';

import { QuestionDto } from './question.dto';

const STREAM = true;

@Injectable()
export class QuestionService {
  constructor(
    private readonly generateAiResponseService: GenerateAiResponseService,
    private readonly createSessionIfNotExistsService: CreateSessionIfNotExistsService,
    private readonly resolveAgentService: ResolveAgentService,
    private readonly recordChatMessageService: RecordChatMessageService,
  ) {}

  async execute(
    dto: QuestionDto,
    user: UserEntity,
    onMessage: (chunk: AIMessageChunk) => void,
  ): Promise<void> {
    const { question, agentId } = dto;

    const agent = await this.resolveAgentService.execute(agentId);

    const session = await this.createSessionIfNotExistsService.execute({
      agent_id: agent.id,
      user_id: user.id,
    });

    // Record user message
    await this.recordChatMessageService.recordUserMessage(
      session.id,
      user.id,
      agent.id,
      question,
    );

    const aiResponse = await this.generateAiResponseService.execute(
      question,
      {
        session_id: session.id,
        user_id: user.id,
        agent_id: agent.id,
      },
      agent,
      STREAM,
    );

    // Collect full response for saving
    let fullResponse = '';

    for await (const chunk of aiResponse as AIMessageChunk[]) {
      if (chunk?.content) {
        fullResponse += chunk.content;
        onMessage(chunk);
      }
    }

    // Record agent message
    if (fullResponse) {
      await this.recordChatMessageService.recordAgentMessage(
        session.id,
        user.id,
        agent.id,
        fullResponse,
      );
    }
  }
}
