import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { Injectable } from '@nestjs/common';

import type { CustomDocument } from 'src/shared/contracts';

@Injectable()
export class ExtractPdfChunksService {
  constructor() {}

  async execute(filePath: string): Promise<CustomDocument[]> {
    const loader = new PDFLoader(filePath);
    const chunks = await loader.load();

    return chunks;
  }
}
