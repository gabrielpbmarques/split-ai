import { Injectable } from '@nestjs/common';

import { ExtractPdfChunksService } from 'src/modules/sources/extract-pdf-chunks/extract-pdf-chunks.service';
import { CustomDocument } from 'src/shared/contracts';

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
