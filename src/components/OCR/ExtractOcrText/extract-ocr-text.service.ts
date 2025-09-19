import { Injectable } from '@nestjs/common';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { GenerateAiResponseService } from 'src/components/ArtificialIntelligence/GenerateAIResponse/generate-ai-response.service';
import { ResolveAgentService } from 'src/components/ArtificialIntelligence/ResolveAgent/resolve-agent.service';
import { DocumentData } from 'src/types';

export interface ExtractOcrTextResponse
  extends Pick<
    DocumentData,
    'documentNumber' | 'cpf' | 'name' | 'birthDate' | 'issueDate' | 'errors'
  > {}

@Injectable()
export class ExtractOcrTextService {
  constructor(
    private client: ImageAnnotatorClient,
    private generateAiResponseService: GenerateAiResponseService,
    private resolveAgentService: ResolveAgentService,
  ) {}

  async execute(
    frontImage: Buffer,
    backImage: Buffer,
  ): Promise<ExtractOcrTextResponse> {
    const requests: any = [frontImage, backImage].map((buffer) => ({
      image: { content: buffer.toString('base64') },
      features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
    }));

    const [response] = await this.client.batchAnnotateImages({ requests });

    const texts = response.responses.map((res) => {
      const [annotation] = res.textAnnotations || [];
      return annotation ? annotation.description.trim() : '';
    });

    const fullText = texts.join(' ');
    const result = await this.extractDocumentData(fullText);

    return result;
  }

  private async extractDocumentData(
    text: string,
  ): Promise<ExtractOcrTextResponse> {
    const agent = await this.resolveAgentService.resolve('extract_document');
    return this.generateAiResponseService.execute(
      text,
      {
        session_id: '',
      },
      agent,
      false,
    );
  }
}
