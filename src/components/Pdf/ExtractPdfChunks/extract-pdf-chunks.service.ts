import { Injectable } from '@nestjs/common';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { CustomDocument } from 'src/types/CustomDocument';

@Injectable()
export class ExtractPdfChunksService {
  constructor() {}

  async execute(filePath: string): Promise<CustomDocument[]> {
    const loader = new PDFLoader(filePath);
    const chunks = await loader.load();

    return chunks;
  }
}
