import { IntegrationGateway } from 'src/infrastructure/integration/integration.state';

export const OCR = Symbol('OCR');

export interface OcrReader extends IntegrationGateway {
  extractText(images: readonly Buffer[]): Promise<string[]>;
}
