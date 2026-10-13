import { ImageAnnotatorClient } from '@google-cloud/vision';
import type { Provider } from '@nestjs/common';

import { env } from 'src/shared/config/env';

export const GOOGLE_VISION_SERVICE = 'GOOGLE_VISION_SERVICE';
export const OCR_SERVICE = GOOGLE_VISION_SERVICE;

export interface IGoogleVisionService {
  extractText(images: readonly Buffer[]): Promise<string[]>;
}

class GoogleVisionService implements IGoogleVisionService {
  private client?: ImageAnnotatorClient;

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

class MockGoogleVisionService implements IGoogleVisionService {
  async extractText(images: readonly Buffer[]): Promise<string[]> {
    return images.map((image) => image.toString('utf-8'));
  }
}

export const GoogleVisionProvider: Provider[] = [
  {
    provide: GOOGLE_VISION_SERVICE,
    useFactory: (): IGoogleVisionService => {
      if (env.INTEGRATION_MODE === 'mock') {
        return new MockGoogleVisionService();
      }
      return new GoogleVisionService();
    },
  },
];
