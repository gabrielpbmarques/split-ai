import { Injectable } from '@nestjs/common';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { QuestionDto } from './question.dto';
import { User } from 'src/models/User.model';
import { GenerateAiResponseService } from 'src/components/ArtificialIntelligence/GenerateAIResponse/generate-ai-response.service';

@Injectable()
export class QuestionService {
  constructor(
    private readonly workerRepository: WorkerRepository,
    private readonly generateAiResponseService: GenerateAiResponseService,
  ) {}

  async execute(dto: QuestionDto, user: User): Promise<void> {
    const { question } = dto;

    const worker = await this.workerRepository.findOne({
      email: user.email,
    });

    if (!worker) {
      throw new Error('Worker not found');
    }

    const aiResponse = await this.generateAiResponseService.execute(
      question,
      'test',
      {
        agent_id: 'support',
      },
      'support',
    );
  }
}
