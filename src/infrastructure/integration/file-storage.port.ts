import type { IntegrationGateway } from 'src/infrastructure/integration/integration.state';

export const FILE_STORAGE = Symbol('FILE_STORAGE');

export interface FileStorage extends IntegrationGateway {
  uploadAudio(localPath: string, fileName: string): Promise<string>;
  deleteFile(fileName: string): Promise<void>;
}
