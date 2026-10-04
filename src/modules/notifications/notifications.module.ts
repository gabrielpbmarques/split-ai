import { Module } from '@nestjs/common';

import { EmailModule } from 'src/modules/notifications/email/email.module';

@Module({
  imports: [EmailModule],
  exports: [EmailModule],
})
export class NotificationsModule {}
