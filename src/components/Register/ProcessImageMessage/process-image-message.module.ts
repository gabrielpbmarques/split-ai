import { Module } from '@nestjs/common';
import { ProcessImageMessageService } from './process-image-message.service';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';

@Module({
  imports: [InfrastructureModule, RepositoriesModule],
  providers: [ProcessImageMessageService],
  exports: [ProcessImageMessageService],
})
export class ProcessImageMessageModule {}
