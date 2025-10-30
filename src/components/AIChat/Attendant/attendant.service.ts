import { Injectable } from '@nestjs/common';
import { QuestionDto } from 'src/components/AIChat/Question/question.dto';
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
  ) {}

  async execute(dto: QuestionDto): Promise<string> {
    const { question, agentId, phone, name } = dto;

    let user = await this.userRepository.findByPhone(phone);
    if (!user) {
      user = await this.userRepository.create({
        phone,
        name: name || null,
        status: 'active',
        origin: 'website',
        role: 'user',
      });
    } else if (!user.name && name) {
      await this.userRepository.update(user.id, { name });
      user = (await this.userRepository.findById(user.id))!;
    }

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
      {
        sessionId: session.id,
        agentId: agent.id,
        organizationId: user.organization_id,
      },
    );

    return aiResponse?.response ? aiResponse.response : (aiResponse ?? '');
  }
}
