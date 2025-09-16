import { Injectable } from '@nestjs/common';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { QuestionDto } from './question.dto';
import { User } from 'src/models/User.model';
import { GenerateAiResponseService } from 'src/components/ArtificialIntelligence/GenerateAIResponse/generate-ai-response.service';
import { CreateSessionIfNotExistsService } from 'src/components/Session/CreateSessionIfNotExists/create-session-if-not-exists.service';
import { AIMessageChunk } from '@langchain/core/messages';
import { MessageRepository } from 'src/supabase-repositories/message.repository';

@Injectable()
export class QuestionService {
  constructor(
    private readonly workerRepository: WorkerRepository,
    private readonly generateAiResponseService: GenerateAiResponseService,
    private readonly createSessionIfNotExistsService: CreateSessionIfNotExistsService,
    private readonly messageRepository: MessageRepository,
  ) {}

  async execute(
    dto: QuestionDto,
    user: User,
    onMessage: (chunk: AIMessageChunk) => void,
  ): Promise<void> {
    const { question } = dto;

    const worker = await this.workerRepository.findOne(
      {
        _id: user.workerId,
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
      {
        agent_id: 'support',
        session_id: session.id,
      },
      true,
      { supportContext },
    );

    let full = '';
    for await (const chunk of aiResponse) {
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
