import { Body, Controller, Post } from '@nestjs/common';
import {
  WhatsappMessageService,
  WhatsappMessageResponse,
} from './whatsapp-message.service';
import { WhatsappMessageDto } from './whatsapp-message.dto';

/**
 * Interface para o corpo da requisição de teste
 */
interface TestWhatsappMessageDto {
  phoneNumber: string;
  message: string;
  mediaUrl?: string;
  sessionId?: string;
}

/**
 * Controlador para testar o fluxo de mensagens do WhatsApp
 * Este controlador é usado apenas para testes e não deve ser exposto em produção
 */
@Controller('test/whatsapp')
export class WhatsappTestController {
  constructor(
    private readonly whatsappMessageService: WhatsappMessageService,
  ) {}

  /**
   * Endpoint para testar o fluxo de mensagens do WhatsApp
   * Permite simular o recebimento de mensagens e imagens
   */
  @Post('message')
  async testMessage(
    @Body() testDto: TestWhatsappMessageDto,
  ): Promise<WhatsappMessageResponse> {
    // Converte o DTO de teste para o DTO real
    const whatsappMessageDto: WhatsappMessageDto = {
      phoneNumber: testDto.phoneNumber,
      message: testDto.message,
      mediaUrl: testDto.mediaUrl,
      sessionId: testDto.sessionId,
    };

    // Executa o fluxo normal de processamento
    return this.whatsappMessageService.execute(whatsappMessageDto);
  }
}
