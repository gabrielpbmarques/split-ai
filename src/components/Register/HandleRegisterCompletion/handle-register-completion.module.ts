import { Module } from '@nestjs/common';
import { HandleRegisterCompletionService } from 'src/components/Register/HandleRegisterCompletion/handle-register-completion.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule, RepositoriesModule],
  providers: [HandleRegisterCompletionService],
  exports: [HandleRegisterCompletionService],
})
export class HandleRegisterCompletionModule {}
