import { Injectable } from '@nestjs/common';
import { AIMessageChunk } from '@langchain/core/messages';
import { LoadAiChatService } from 'src/components/Langchain/LoadAiChat/load-ai-chat.service';
import { RegisterChatDTO } from './register.dto';
import { CustomMetadata } from 'src/types/CustomMetadata';
import { agents } from 'src/constants/chats/chats';

@Injectable()
export class RegisterService {
  constructor(private loadAIChatService: LoadAiChatService) {}

  async execute(
    dto: RegisterChatDTO,
    onMessage: (chunk: AIMessageChunk) => void,
    fileId?: string,
    clientId?: string,
  ): Promise<void> {
    const { message } = dto;

    const metadata: CustomMetadata = {
      file_id: fileId,
      client_id: clientId,
    };

    const agent = agents['register_chat'];

    const { runnable, config } = await this.loadAIChatService.execute(
      message,
      metadata,
      fileId,
      agent,
    );

    const response = await runnable.stream(
      {
        input: message,
      },
      config,
    );

    for await (const chunk of response) {
      onMessage(chunk);
    }
  }
}
