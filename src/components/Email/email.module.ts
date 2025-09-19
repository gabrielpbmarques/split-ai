import { Module } from '@nestjs/common';
import { EmailService } from 'src/components/Email/email.service';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
