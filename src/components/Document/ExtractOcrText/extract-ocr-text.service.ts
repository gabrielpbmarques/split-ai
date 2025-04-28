import { Injectable } from '@nestjs/common';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { DocumentData } from 'src/models/Worker.model';
import { ProcessMessageDataService } from 'src/components/MessageProcessing/ProcessMessageData/process-message-data.service';

@Injectable()
export class ExtractOcrTextService {
  constructor(
    private client: ImageAnnotatorClient,
    private processMessageDataService: ProcessMessageDataService,
  ) {}

  async execute(buffers: Buffer[]): Promise<DocumentData> {
    const requests: any = buffers.map((buffer) => ({
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

    console.log('Result:', result);

    return result;
  }

  private extractDocumentData(text: string): Promise<DocumentData> {
    return this.processMessageDataService.execute({
      message: text,
      agentId: 'extract_document',
    });
  }
}
