import { BadGatewayException, Inject, Injectable } from '@nestjs/common';

import { OCR, type OcrReader } from 'src/infrastructure/integration/ocr.port';
import { GenerateAiResponseService } from 'src/modules/agent-runtime/generate-ai-response/generate-ai-response.service';
import { ResolveAgentService } from 'src/modules/agent-runtime/resolve-agent/resolve-agent.service';
import type { DocumentData } from 'src/shared/contracts';

export interface ExtractOcrTextResponse extends Pick<
  DocumentData,
  'documentNumber' | 'cpf' | 'name' | 'birthDate' | 'issueDate' | 'errors'
> {}

@Injectable()
export class ExtractOcrTextService {
  constructor(
    @Inject(OCR) private readonly ocr: OcrReader,
    private readonly generateAiResponseService: GenerateAiResponseService,
    private readonly resolveAgentService: ResolveAgentService,
  ) {}

  async execute(
    frontImage: Buffer,
    backImage: Buffer,
  ): Promise<ExtractOcrTextResponse> {
    const texts = await this.ocr.extractText([frontImage, backImage]);

    return this.extractDocumentData(texts.join(' '));
  }

  private async extractDocumentData(
    text: string,
  ): Promise<ExtractOcrTextResponse> {
    const agent = await this.resolveAgentService.execute('extract_document');
    const answer = await this.generateAiResponseService.execute(
      text,
      { session_id: '', agent_id: agent.id },
      agent,
      false,
    );

    if (typeof answer !== 'string') {
      throw new BadGatewayException('Resposta inesperada do agente de OCR');
    }

    return this.parseDocumentData(answer);
  }

  private parseDocumentData(answer: string): ExtractOcrTextResponse {
    try {
      return JSON.parse(answer) as ExtractOcrTextResponse;
    } catch {
      return { errors: [answer] } as ExtractOcrTextResponse;
    }
  }
}
