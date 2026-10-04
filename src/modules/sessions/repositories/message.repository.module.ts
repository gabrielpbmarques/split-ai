import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MessageEntity } from 'src/infrastructure/database/schema';
import { MessageRepository } from 'src/modules/sessions/repositories/message.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MessageEntity])],
  providers: [MessageRepository],
  exports: [MessageRepository],
})
export class MessageRepositoryModule {}
