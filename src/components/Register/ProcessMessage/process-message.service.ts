import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Worker, WorkerDocument } from 'src/schemas/Worker.schema';
import { ProcessMessageDto } from './process-message.dto';
import { GenerateAiResponseService } from '../Common/generate-ai-response.service';
import { CustomMetadata } from 'src/types/CustomMetadata';

@Injectable()
export class ProcessMessageService {
  constructor(
    @InjectModel(Worker.name) private workerModel: Model<WorkerDocument>,
    private generateAiResponseService: GenerateAiResponseService,
  ) {}

  async execute(processMessageDto: ProcessMessageDto) {
    const { phoneNumber, message, sessionId } = processMessageDto;

    // Buscar o worker pelo phoneId
    const worker = await this.workerModel.findOne({ phoneId: phoneNumber });

    if (!worker) {
      throw new Error('Usuário não encontrado');
    }

    // Preparar os metadados para a IA
    const metadata: CustomMetadata = {
      phone_number: phoneNumber,
      registration_stage: worker.signupStage,
      user_id: worker.userId,
    };

    // Gerar resposta da IA
    const response = await this.generateAiResponseService.execute(
      message,
      sessionId,
      metadata,
    );

    // Aqui seria implementada a lógica para processar a resposta do usuário
    // e atualizar o estágio do cadastro com base na resposta da IA

    return {
      sessionId,
      message: response,
      currentStage: worker.signupStage,
    };
  }
}
