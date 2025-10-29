import { Injectable, NotFoundException } from '@nestjs/common';
import { QuestionDto } from 'src/components/AIChat/Question/question.dto';
import { GenerateAiResponseService } from 'src/components/ArtificialIntelligence/GenerateAIResponse/generate-ai-response.service';
import { ResolveAgentService } from 'src/components/ArtificialIntelligence/ResolveAgent/resolve-agent.service';
import { CreateSessionIfNotExistsService } from 'src/components/Session/CreateSessionIfNotExists/create-session-if-not-exists.service';
import { ReportRepository, UserRepository } from 'src/repositories';

@Injectable()
export class AttendantService {
  constructor(
    private readonly generateAiResponseService: GenerateAiResponseService,
    private readonly createSessionIfNotExistsService: CreateSessionIfNotExistsService,
    private readonly resolveAgentService: ResolveAgentService,
    private readonly reportRepository: ReportRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(dto: QuestionDto): Promise<string> {
    const { question, agentId, phone } = dto;

    const user = await this.userRepository.findByPhone(phone);

    if (!user) throw new NotFoundException('Usuário não encontrado');

    const agent = await this.resolveAgentService.resolve(agentId);

    const session = await this.createSessionIfNotExistsService.execute({
      agent_id: agent.id,
      user_id: user.id,
    });

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

    if (aiResponse.conversationFinished) {
      const { type, summary, insights, sentiment, phone, name, email } =
        aiResponse as any;

      await this.reportRepository.create({
        session_id: session.id,
        agent_id: agent.id,
        organization_id: user.role === 'admin' ? null : user.organization_id,
        type,
        sentiment,
        summary,
        insights,
        phone,
        name,
        email,
      });
    }

    return aiResponse?.response ? aiResponse.response : (aiResponse ?? '');
  }
}
