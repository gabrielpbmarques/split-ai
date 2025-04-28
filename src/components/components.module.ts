import { Module } from '@nestjs/common';
import { LangchainModule } from 'src/components/Langchain/langchain.module';
import { PromptModule } from 'src/components/Prompt/prompt.module';
import { RegisterModule } from 'src/components/Register/register.module';
import { DocumentValidationModule } from 'src/components/Document/DocumentValidation/document-validation.module';

@Module({
  imports: [
    LangchainModule,
    PromptModule,
    RegisterModule,
    DocumentValidationModule,
  ],
  exports: [
    LangchainModule,
    PromptModule,
    RegisterModule,
    DocumentValidationModule,
  ],
})
export class ComponentsModule {}
