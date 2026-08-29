import { Module } from '@nestjs/common';
import { UserRepositoryModule } from 'src/repositories/user.repository.module';

import { RegisterLiteController } from './register-lite.controller';
import { RegisterLiteService } from './register-lite.service';

@Module({
  imports: [UserRepositoryModule],
  controllers: [RegisterLiteController],
  providers: [RegisterLiteService],
  exports: [RegisterLiteService],
})
export class RegisterLiteModule {}
