import { Injectable } from '@nestjs/common';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { DocumentData } from 'src/models/Worker.model';
import { ProcessMessageDataService } from 'src/components/MessageProcessing/ProcessMessageData/process-message-data.service';

export interface ExtractOcrTextResponse
  extends Pick<
    DocumentData,
    'documentNumber' | 'cpf' | 'name' | 'birthDate' | 'issueDate' | 'errors'
  > {}

@Injectable()
export class ExtractOcrTextService {
  constructor(
    private client: ImageAnnotatorClient,
    private processMessageDataService: ProcessMessageDataService,
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

    console.log('Full Text:', fullText);

    const result = await this.extractDocumentData(fullText);

    return result;
  }

  private extractDocumentData(text: string): Promise<ExtractOcrTextResponse> {
    return this.processMessageDataService.execute({
      message: text,
      sessionId: '',
      agentId: 'extract_document',
    });
  }
}
