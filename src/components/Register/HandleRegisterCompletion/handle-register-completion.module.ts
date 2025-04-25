import { Module } from '@nestjs/common';
import { HandleRegisterCompletionService } from './handle-register-completion.service';
import { RepositoriesModule } from '../../../repositories/repositories.module';
import { InfrastructureModule } from '../../../infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule, RepositoriesModule],
  providers: [HandleRegisterCompletionService],
  exports: [HandleRegisterCompletionService],
})
export class HandleRegisterCompletionModule {}
