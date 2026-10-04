import fs from 'fs';
import path from 'path';

import { Injectable } from '@nestjs/common';
import axios from 'axios';

import { ProcessPdfService } from 'src/modules/sources/process-pdf/process-pdf.service';
import { CustomDocument } from 'src/shared/contracts';

@Injectable()
export class LoadPdfService {
  constructor(private readonly processPdfService: ProcessPdfService) {}

  async execute(url: string): Promise<CustomDocument[]> {
    const pdfBuffer = await this.downloadPDF(url);
    const tempFilePath = this.savePdfBuffer(pdfBuffer);

    const chunks = await this.processPdfService.execute(tempFilePath);

    fs.unlinkSync(tempFilePath);
    return chunks;
  }

  async executeFromBuffer(buffer: Buffer): Promise<CustomDocument[]> {
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

  private async downloadPDF(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
  }
}
