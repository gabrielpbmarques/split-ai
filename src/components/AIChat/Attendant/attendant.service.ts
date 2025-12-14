import { Injectable } from '@nestjs/common';
import { QuestionDto } from 'src/components/AIChat/Question/question.dto';
import { RecordChatMessageService } from 'src/components/AIChat/RecordChatMessage/record-chat-message.service';
import { GenerateAiResponseService } from 'src/components/ArtificialIntelligence/GenerateAIResponse/generate-ai-response.service';
import { ResolveAgentService } from 'src/components/ArtificialIntelligence/ResolveAgent/resolve-agent.service';
import { CreateSessionIfNotExistsService } from 'src/components/Session/CreateSessionIfNotExists/create-session-if-not-exists.service';
import { UserRepository } from 'src/repositories';

@Injectable()
export class AttendantService {
  constructor(
    private readonly generateAiResponseService: GenerateAiResponseService,
    private readonly createSessionIfNotExistsService: CreateSessionIfNotExistsService,
    private readonly resolveAgentService: ResolveAgentService,
    private readonly userRepository: UserRepository,
    private readonly recordChatMessageService: RecordChatMessageService,
  ) {}

  async execute(dto: QuestionDto): Promise<string> {
    const { question, agentId, phone, name } = dto;

    let user = phone ? await this.userRepository.findByPhone(phone) : null;

    if (!user) {
      user = await this.userRepository.create({
        phone: phone || null,
        name: name || null,
        status: 'active',
        origin: 'website',
        role: 'user',
      });
    } else if (!user.name && name) {
      await this.userRepository.update(user.id, { name });
      user = await this.userRepository.findById(user.id);
    }

    const session = await this.createSessionIfNotExistsService.execute({
      agent_id: agentId,
      user_id: user.id,
    });

    // Record user message
    await this.recordChatMessageService.recordUserMessage(
      session.id,
      user.id,
      agentId,
      question,
    );

    const promptVariables = {
      sessionId: session.id,
      agentId,
      organizationId: user.organization_id,
      userName: user.name,
      userPhone: user.phone,
      userId: user.id,
    };

    const agent = await this.resolveAgentService.execute(
      agentId,
      promptVariables,
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
      await this.recordChatMessageService.recordAgentMessage(
        session.id,
        user.id,
        agentId,
        typeof aiResponse === 'string'
          ? aiResponse
          : JSON.stringify(aiResponse),
      );
    }

    return aiResponse;
  }
}
