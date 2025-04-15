import { Module } from '@nestjs/common';
import { ProcessImageMessageService } from './process-image-message.service';
import { ProcessImageTestController } from './process-image-test.controller';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';

@Module({
  imports: [InfrastructureModule, RepositoriesModule],
  controllers: [ProcessImageTestController],
  providers: [ProcessImageMessageService],
  exports: [ProcessImageMessageService],
})
export class ProcessImageMessageModule {}
