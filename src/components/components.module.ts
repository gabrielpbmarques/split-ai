import { Module } from '@nestjs/common';
import { LangchainModule } from './Langchain/langchain.module';
import { PromptModule } from './Prompt/prompt.module';
import { RegisterModule } from './Register/register.module';

@Module({
  imports: [LangchainModule, PromptModule, RegisterModule],
  exports: [LangchainModule, PromptModule, RegisterModule],
})
export class ComponentsModule {}
