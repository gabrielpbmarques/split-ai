import { Injectable } from '@nestjs/common';
import { QuestionDto } from 'src/components/AIChat/Question/question.dto';
import { RecordChatMessageService } from 'src/components/AIChat/RecordChatMessage/record-chat-message.service';
import { GenerateAiResponseService } from 'src/components/ArtificialIntelligence/GenerateAIResponse/generate-ai-response.service';
import { ResolveAgentService } from 'src/components/ArtificialIntelligence/ResolveAgent/resolve-agent.service';
import { CreateSessionIfNotExistsService } from 'src/components/Session/CreateSessionIfNotExists/create-session-if-not-exists.service';
import { UserEntity } from 'src/entities';
import { User } from 'src/types';

@Injectable()
export class AttendantService {
  constructor(
    private readonly generateAiResponseService: GenerateAiResponseService,
    private readonly createSessionIfNotExistsService: CreateSessionIfNotExistsService,
    private readonly resolveAgentService: ResolveAgentService,
    private readonly recordChatMessageService: RecordChatMessageService,
  ) {}

  async execute(dto: QuestionDto, loggedUser: User): Promise<string> {
    const user: UserEntity = loggedUser as unknown as UserEntity;
    const { question, agentId } = dto;

    const promptVariables = {
      agentId,
      userName: user.name,
      userPhone: user.phone,
      userId: user.id,
    };

    const agent = await this.resolveAgentService.execute(
      agentId,
      promptVariables,
    );

    const session = await this.createSessionIfNotExistsService.execute({
      agent_id: agent.id,
      user_id: user.id,
      organization_id: agent.organization_id,
    });

    // Record user message
    await this.recordChatMessageService.execute(
      session.id,
      user.id,
      agentId,
      question,
      'user',
    );

    const aiResponse = await this.generateAiResponseService.execute(
      question,
      {
        session_id: session.id,
        user_id: user.id,
        agent_id: agent.id,
      },
      agent,
      false,
    );

    // Record agent message
    if (aiResponse) {
      await this.recordChatMessageService.execute(
        session.id,
        user.id,
        agentId,
        typeof aiResponse === 'string'
          ? aiResponse
          : JSON.stringify(aiResponse),
        'agent',
      );
    }

    return aiResponse;
  }
}
