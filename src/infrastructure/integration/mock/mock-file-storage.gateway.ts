import { FileStorage } from 'src/infrastructure/integration/file-storage.port';
import { IntegrationState } from 'src/infrastructure/integration/integration.state';

export class MockFileStorageGateway implements FileStorage {
  readonly name = 'gcs';

  readonly uploaded: string[] = [];

  state(): IntegrationState {
    return 'MOCK';
  }

  async uploadAudio(_localPath: string, fileName: string): Promise<string> {
    this.uploaded.push(fileName);
    return `https://storage.mock.local/${fileName}`;
  }

  async deleteFile(fileName: string): Promise<void> {
    const index = this.uploaded.indexOf(fileName);
    if (index >= 0) this.uploaded.splice(index, 1);
  }
}
