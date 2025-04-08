import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Worker, WorkerDocument } from 'src/schemas/Worker.schema';
import { StartRegistrationDto } from './start-registration.dto';
import { GenerateAiResponseService } from '../Common/generate-ai-response.service';
import { CustomMetadata } from 'src/types/CustomMetadata';

@Injectable()
export class StartRegistrationService {
  constructor(
    @InjectModel(Worker.name) private workerModel: Model<WorkerDocument>,
    private generateAiResponseService: GenerateAiResponseService,
  ) {}

  async execute(startRegistrationDto: StartRegistrationDto) {
    const { phoneNumber, name } = startRegistrationDto;

    // Verificar se já existe um cadastro com esse número
    let worker = await this.workerModel.findOne({ phoneId: phoneNumber });

    if (!worker) {
      // Criar um novo worker com os dados iniciais
      worker = await this.workerModel.create({
        phoneId: phoneNumber,
        name,
        signupStage: 'welcome',
        userId: uuidv4(),
      });
    }

    // Gerar a primeira mensagem de boas-vindas usando a IA
    const sessionId = worker.userId;
    const metadata: CustomMetadata = {
      phone_number: phoneNumber,
      registration_stage: worker.signupStage,
    };

    const initialQuestion = 'Iniciar cadastro';
    const response = await this.generateAiResponseService.execute(
      initialQuestion,
      sessionId,
      metadata,
    );

    return {
      sessionId,
      message: response,
      currentStage: worker.signupStage,
    };
  }
}
