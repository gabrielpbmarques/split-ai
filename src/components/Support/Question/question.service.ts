import { Injectable } from '@nestjs/common';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { QuestionDto } from './question.dto';
import { User } from 'src/models/User.model';
import { GenerateAiResponseService } from 'src/components/ArtificialIntelligence/GenerateAIResponse/generate-ai-response.service';
import { CreateSessionIfNotExistsService } from 'src/components/Session/CreateSessionIfNotExists/create-session-if-not-exists.service';

@Injectable()
export class QuestionService {
  constructor(
    private readonly workerRepository: WorkerRepository,
    private readonly generateAiResponseService: GenerateAiResponseService,
    private readonly createSessionIfNotExistsService: CreateSessionIfNotExistsService,
  ) {}

  async execute(dto: QuestionDto, user: User): Promise<string> {
    const { question } = dto;

    const worker = await this.workerRepository.findOne(
      {
        email: user.email,
      },
      {
        name: 1,
        email: 1,
        status: 1,
        signupStage: 1,
        hasNoShowedOnLastMission: 1,
        hasPassport: 1,
        'documents.rgFrontId': 1,
        'documents.rgBackId': 1,
        'documents.profilePictureId': 1,
        'documents.status': 1,
      },
    );

    let supportContext: any = {};

    if (worker) {
      supportContext = { ...worker };
    }

    const session = await this.createSessionIfNotExistsService.execute({
      agent_id: 'support',
      user_id: user._id,
    });

    const aiResponse = await this.generateAiResponseService.execute(
      question,
      session.id,
      {
        agent_id: 'support',
      },
      'support',
      { supportContext },
    );

    return aiResponse;
  }
}
