import { Module } from '@nestjs/common';
import { NormalizePromptInstructionsModule } from 'src/components/ArtificialIntelligence/NormalizePromptInstructions/normalize-prompt-instructions.module';
import { LoadDatabaseToolModule } from 'src/components/Tools/LoadDatabaseTool/load-database-tool.module';

import { ExecuteSimilaritySearchModule } from '../ExecuteSimilaritySearch/execute-similarity-search.module';
import { LoadVectorStoreModule } from '../LoadVectorStore/load-vector-store.module';

import { BuildSystemPromptService } from './build-system-prompt.service';

@Module({
  imports: [
    NormalizePromptInstructionsModule,
    ExecuteSimilaritySearchModule,
    LoadVectorStoreModule,
    LoadDatabaseToolModule,
  ],
  providers: [BuildSystemPromptService],
  exports: [BuildSystemPromptService],
})
export class BuildSystemPromptModule {}
