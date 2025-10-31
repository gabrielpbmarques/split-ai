import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { RegisterLiteController } from './register-lite.controller';
import { RegisterLiteService } from './register-lite.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [RegisterLiteController],
  providers: [RegisterLiteService],
  exports: [RegisterLiteService],
})
export class RegisterLiteModule {}
