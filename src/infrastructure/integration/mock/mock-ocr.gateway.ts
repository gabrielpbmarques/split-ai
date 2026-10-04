import { IntegrationState } from 'src/infrastructure/integration/integration.state';
import { OcrReader } from 'src/infrastructure/integration/ocr.port';

export class MockOcrGateway implements OcrReader {
  readonly name = 'google-vision';

  state(): IntegrationState {
    return 'MOCK';
  }

  async extractText(images: readonly Buffer[]): Promise<string[]> {
    return images.map((image) => image.toString('utf-8'));
  }
}
