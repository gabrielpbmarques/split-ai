import fs from 'fs';
import path from 'path';

import { Injectable } from '@nestjs/common';

import { ProcessPdfService } from 'src/modules/sources/process-pdf/process-pdf.service';
import type { CustomDocument } from 'src/shared/contracts';

@Injectable()
export class LoadPdfService {
  constructor(private readonly processPdfService: ProcessPdfService) {}

  async execute(buffer: Buffer): Promise<CustomDocument[]> {
    const tempFilePath = this.savePdfBuffer(buffer);
    const chunks = await this.processPdfService.execute(tempFilePath);
    fs.unlinkSync(tempFilePath);
    return chunks;
  }

  private savePdfBuffer(buffer: Buffer): string {
    const tempFilePath = path.join(__dirname, `temp.pdf`);
    fs.writeFileSync(tempFilePath, new Uint8Array(buffer));
    return tempFilePath;
  }
}
