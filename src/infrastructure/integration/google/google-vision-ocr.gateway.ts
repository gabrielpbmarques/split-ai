import { ImageAnnotatorClient } from '@google-cloud/vision';

import { IntegrationState } from 'src/infrastructure/integration/integration.state';
import { OcrReader } from 'src/infrastructure/integration/ocr.port';

export class GoogleVisionOcrGateway implements OcrReader {
  readonly name = 'google-vision';

  private client?: ImageAnnotatorClient;

  state(): IntegrationState {
    return 'READY';
  }

  async extractText(images: readonly Buffer[]): Promise<string[]> {
    this.client ??= new ImageAnnotatorClient();

    const [response] = await this.client.batchAnnotateImages({
      requests: images.map((buffer) => ({
        image: { content: buffer.toString('base64') },
        features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
      })),
    });

    return (response.responses ?? []).map((item) => {
      const [annotation] = item.textAnnotations ?? [];
      return annotation?.description?.trim() ?? '';
    });
  }
}
