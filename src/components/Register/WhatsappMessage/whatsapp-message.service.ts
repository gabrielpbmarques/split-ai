import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { Worker, WorkerDocument } from 'src/schemas/Worker.schema';
import { WhatsappMessageDto } from './whatsapp-message.dto';
import { GenerateAiResponseService } from '../Common/generate-ai-response.service';
import { CustomMetadata } from 'src/types/CustomMetadata';
import { LoadAiChatService } from '../../Langchain/LoadAiChat/load-ai-chat.service';
import { agents } from 'src/constants/chats/chats';

@Injectable()
export class WhatsappMessageService {
  constructor(
    @InjectModel(Worker.name) private workerModel: Model<WorkerDocument>,
    private generateAiResponseService: GenerateAiResponseService,
    private loadAiChatService: LoadAiChatService,
  ) {}

  async execute(whatsappMessageDto: WhatsappMessageDto) {
    const {
      phoneNumber,
      message,
      sessionId: existingSessionId,
    } = whatsappMessageDto;

    // Buscar o worker pelo phoneId
    let worker = await this.workerModel.findOne({ phoneId: phoneNumber });
    let sessionId = existingSessionId;
    let isNewUser = false;

    // Se não encontrar o worker, é um novo usuário
    if (!worker) {
      isNewUser = true;
      // Gerar um ID de sessão
      sessionId = uuidv4();

      // Criar um worker temporário com valores padrão
      // Esses valores serão atualizados durante o processo de cadastro
      const temporaryCpf = `temp-${Date.now()}`;
      const hashCpf = createHash('sha256').update(temporaryCpf).digest('hex');

      worker = await this.workerModel.create({
        phoneId: phoneNumber,
        name: 'Novo Usuário', // Será atualizado durante o cadastro
        signupStage: 'welcome',
        userId: sessionId,
        // Campos obrigatórios com valores temporários
        email: `temp-${sessionId}@placeholder.com`,
        cpf: temporaryCpf,
        hashCpf,
        birthDate: new Date(), // Data temporária
      });
    } else if (!sessionId) {
      // Se encontrou o worker mas não tem sessionId, usa o userId do worker
      sessionId = worker.userId;
    }

    // Preparar os metadados para a IA
    const metadata: CustomMetadata = {
      phone_number: phoneNumber,
      registration_stage: worker.signupStage,
      user_id: worker.userId,
      is_new_user: isNewUser,
      // Incluir dados do usuário que já temos
      user_data: {
        name: worker.name,
        email:
          worker.email !== `temp-${worker.userId}@placeholder.com`
            ? worker.email
            : null,
        cpf: !worker.cpf.startsWith('temp-') ? worker.cpf : null,
        // Adicionar outros campos conforme necessário
      },
    };

    // Gerar resposta da IA usando o agente específico para WhatsApp
    const aiResponse = await this.generateWhatsappResponse(
      message,
      sessionId,
      metadata,
    );

    // Processar a resposta da IA
    // No futuro, podemos implementar um parser para extrair comandos da resposta da IA
    // Por exemplo, a IA pode retornar um JSON com a mensagem e comandos para atualizar o banco de dados

    return {
      sessionId,
      message: aiResponse,
      currentStage: worker.signupStage,
    };
  }

  // Método para atualizar dados do worker com base nas informações coletadas pela IA
  // Este método seria chamado quando a IA identificar informações válidas na mensagem do usuário
  private async updateWorkerData(workerId: string, data: any) {
    await this.workerModel.findOneAndUpdate(
      { userId: workerId },
      { $set: data },
    );
  }

  // Método específico para gerar respostas usando o agente de WhatsApp
  private async generateWhatsappResponse(
    question: string,
    sessionId: string,
    metadata: CustomMetadata,
  ): Promise<string> {
    try {
      const agent = agents.whatsapp_register;
      const runnable = await this.loadAiChatService.execute(
        question,
        metadata,
        sessionId,
        agent,
      );

      const result = await runnable.runnable.invoke(
        {
          input: question,
        },
        runnable.config,
      );

      // No futuro, podemos implementar aqui um parser para extrair comandos da resposta da IA
      // Por exemplo, a IA pode retornar um JSON com a mensagem e comandos para atualizar o banco de dados

      return result.content.toString();
    } catch (error) {
      console.error('Erro ao gerar resposta da IA:', error);
      return 'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?';
    }
  }
}
