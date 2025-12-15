import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { CreateCheckoutController } from './create-checkout.controller';
import { CreateCheckoutService } from './create-checkout.service';

@Module({
  imports: [InfrastructureModule, RepositoriesModule],
  providers: [CreateCheckoutService],
  controllers: [CreateCheckoutController],
  exports: [CreateCheckoutService],
})
export class CreateCheckoutModule {}
