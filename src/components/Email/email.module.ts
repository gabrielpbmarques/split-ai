import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { EmailService } from 'src/components/Email/email.service';

@Module({
  imports: [InfrastructureModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
