import { Injectable } from '@nestjs/common';
import { CustomDocument } from 'src/types/CustomDocument';
import { ExtractPdfChunksService } from '../ExtractPdfChunks/extract-pdf-chunks.service';

@Injectable()
export class ProcessPdfService {
  constructor(
    private readonly extractPdfChunksService: ExtractPdfChunksService,
  ) {}

  public async execute(filePath: string): Promise<CustomDocument[]> {
    const chunks = await this.extractPdfChunksService.execute(filePath);

    return chunks;
  }
}
