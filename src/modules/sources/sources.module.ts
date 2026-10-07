import { Module } from '@nestjs/common';

import { DeleteSourceModule } from 'src/modules/sources/delete-source/delete-source.module';
import { ExtractOcrTextModule } from 'src/modules/sources/extract-ocr-text/extract-ocr-text.module';
import { ExtractPdfChunksModule } from 'src/modules/sources/extract-pdf-chunks/extract-pdf-chunks.module';
import { GenerateAgentSourceModule } from 'src/modules/sources/generate-agent-source/generate-agent-source.module';
import { GetSourceModule } from 'src/modules/sources/get-source/get-source.module';
import { ListSourcesModule } from 'src/modules/sources/list-sources/list-sources.module';
import { LoadPdfModule } from 'src/modules/sources/load-pdf/load-pdf.module';
import { ProcessDocxSourceModule } from 'src/modules/sources/process-docx-source/process-docx-source.module';
import { ProcessPdfModule } from 'src/modules/sources/process-pdf/process-pdf.module';
import { ProcessPdfSourceModule } from 'src/modules/sources/process-pdf-source/process-pdf-source.module';
import { ProcessTextSourceModule } from 'src/modules/sources/process-text-source/process-text-source.module';
import { RecordInterruptedSourcesModule } from 'src/modules/sources/record-interrupted-sources/record-interrupted-sources.module';
import { ResolveSourceAgentModule } from 'src/modules/sources/resolve-source-agent/resolve-source-agent.module';

@Module({
  imports: [
    DeleteSourceModule,
    ExtractOcrTextModule,
    ExtractPdfChunksModule,
    GenerateAgentSourceModule,
    GetSourceModule,
    ListSourcesModule,
    LoadPdfModule,
    ProcessDocxSourceModule,
    ProcessPdfModule,
    ProcessPdfSourceModule,
    ProcessTextSourceModule,
    RecordInterruptedSourcesModule,
    ResolveSourceAgentModule,
  ],
  exports: [
    DeleteSourceModule,
    ExtractOcrTextModule,
    ExtractPdfChunksModule,
    GenerateAgentSourceModule,
    GetSourceModule,
    ListSourcesModule,
    LoadPdfModule,
    ProcessDocxSourceModule,
    ProcessPdfModule,
    ProcessPdfSourceModule,
    ProcessTextSourceModule,
    RecordInterruptedSourcesModule,
    ResolveSourceAgentModule,
  ],
})
export class SourcesModule {}
