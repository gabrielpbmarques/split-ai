import { Injectable } from '@nestjs/common';
import { GenerateAiResponseService } from 'src/components/ArtificialIntelligence/GenerateAIResponse/generate-ai-response.service';
import { ResolveAgentService } from 'src/components/ArtificialIntelligence/ResolveAgent/resolve-agent.service';

import { RecordChatMessageService } from '../RecordChatMessage/record-chat-message.service';

import { ExtractDocumentDataDto } from './extract-document-data.dto';

@Injectable()
export class ExtractDocumentDataService {
  constructor(
    private readonly generateAiResponseService: GenerateAiResponseService,
    private readonly resolveAgentService: ResolveAgentService,
    private readonly recordChatMessageService: RecordChatMessageService,
  ) {}

  async execute(dto: ExtractDocumentDataDto): Promise<any> {
    return dto;
  }
}
