import { Module } from '@nestjs/common';
import { ProcessImageMessageService } from './process-image-message.service';
import { ProcessImageTestController } from './process-image-test.controller';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  controllers: [ProcessImageTestController],
  providers: [ProcessImageMessageService],
  exports: [ProcessImageMessageService],
})
export class ProcessImageMessageModule {}
