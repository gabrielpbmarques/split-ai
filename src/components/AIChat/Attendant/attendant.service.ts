import { Injectable } from '@nestjs/common';
import { QuestionDto } from 'src/components/AIChat/Question/question.dto';
import { GenerateAiResponseService } from 'src/components/ArtificialIntelligence/GenerateAIResponse/generate-ai-response.service';
import { ResolveAgentService } from 'src/components/ArtificialIntelligence/ResolveAgent/resolve-agent.service';
import { CreateSessionIfNotExistsService } from 'src/components/Session/CreateSessionIfNotExists/create-session-if-not-exists.service';
import { MessageRepository } from 'src/repositories';
import { ReportRepository } from 'src/repositories/report.repository';
import { User } from 'src/types';

@Injectable()
export class AttendantService {
  constructor(
    private readonly generateAiResponseService: GenerateAiResponseService,
    private readonly createSessionIfNotExistsService: CreateSessionIfNotExistsService,
    private readonly messageRepository: MessageRepository,
    private readonly resolveAgentService: ResolveAgentService,
    private readonly reportRepository: ReportRepository,
  ) {}

  async execute(dto: QuestionDto, user: User): Promise<string> {
    const { question, agentId } = dto;

    const agent = await this.resolveAgentService.resolve(agentId);

    const session = await this.createSessionIfNotExistsService.execute({
      agent_id: agent.id,
      user_id: user.id,
    });

    const aiResponse = await this.generateAiResponseService.execute(
      question,
      {
        session_id: session.id,
      },
      agent,
      false,
    );

    await this.messageRepository.create({
      session_id: session.id,
      message: aiResponse.response,
      from: 'agent',
    });

    if (aiResponse.conversationFinished) {
      const { type, summary, insights, sentiment } = aiResponse;

      console.log({
        session_id: session.id,
        agent_id: agent.id,
        organization_id: user.role === 'admin' ? null : user.organization_id,
        type,
        sentiment,
        summary,
        insights,
      });

      await this.reportRepository.create({
        session_id: session.id,
        agent_id: agent.id,
        organization_id: user.role === 'admin' ? null : user.organization_id,
        type,
        sentiment,
        summary,
        insights,
      });
    }

    return aiResponse.response;
  }
}
